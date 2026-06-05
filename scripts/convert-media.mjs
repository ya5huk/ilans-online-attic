// Build-time media converter for iPhone originals.
//
// Local /public HEIC/HEIF and MOV files are converted into browser-friendly
// siblings under /public/_generated/media, and a manifest maps the original
// authoring path to the generated public path. Markdown can keep referring to
// the original files; src/lib/blog.ts rewrites to these generated assets.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { spawnSync } from "child_process";
import { createHash } from "crypto";
import { dirname, extname, join, relative, sep } from "path";

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");
const GENERATED_REL = "_generated/media";
const MANIFEST_FILE = join(ROOT, "src", "lib", "mediaConversions.json");

const CONVERTIBLE_RE = /\.(heic|heif|mov)$/i;
const HEIC_RE = /\.(heic|heif)$/i;
const MOV_RE = /\.mov$/i;

let sharpModule;

function walk(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store") continue;
    const full = join(dir, name);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (relative(PUBLIC_DIR, full).split(sep).join("/") === GENERATED_REL) {
        continue;
      }
      found.push(...walk(full));
    } else if (CONVERTIBLE_RE.test(name)) {
      found.push(full);
    }
  }
  return found;
}

function publicRelative(file) {
  return relative(PUBLIC_DIR, file).split(sep).join("/");
}

function fileHash(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 12);
}

function outputRelative(inputRel, hash) {
  const ext = extname(inputRel);
  const stem = inputRel.slice(0, -ext.length);
  return `${GENERATED_REL}/${stem}.${hash}${
    HEIC_RE.test(ext) ? ".webp" : ".mp4"
  }`;
}

function hasCommand(command) {
  const versionArgs = command === "sips" ? ["--version"] : ["-version"];
  const result = spawnSync(command, versionArgs, {
    encoding: "utf8",
    stdio: "ignore",
  });
  return result.status === 0;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    const details = [result.stderr, result.stdout].filter(Boolean).join("\n");
    throw new Error(`${command} failed${details ? `:\n${details}` : ""}`);
  }
}

async function getSharp() {
  if (sharpModule !== undefined) return sharpModule;
  try {
    const mod = await import("sharp");
    sharpModule = mod.default ?? mod;
  } catch {
    sharpModule = null;
  }
  return sharpModule;
}

async function convertHeic(inputFile, outputFile) {
  let lastError;
  const sharp = await getSharp();

  if (sharp) {
    try {
      await sharp(inputFile, { failOn: "none" })
        .rotate()
        .webp({ quality: 82 })
        .toFile(outputFile);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  if (hasCommand("sips")) {
    const tmpPng = `${outputFile}.tmp.png`;
    try {
      run("sips", ["-s", "format", "png", inputFile, "--out", tmpPng]);
      if (sharp) {
        await sharp(tmpPng).webp({ quality: 82 }).toFile(outputFile);
      } else if (hasCommand("ffmpeg")) {
        run("ffmpeg", [
          "-hide_banner",
          "-loglevel",
          "error",
          "-y",
          "-i",
          tmpPng,
          "-frames:v",
          "1",
          outputFile,
        ]);
      } else {
        throw new Error("sips converted HEIC to PNG, but no WebP encoder exists");
      }
      return;
    } catch (error) {
      lastError = error;
    } finally {
      rmSync(tmpPng, { force: true });
    }
  }

  if (hasCommand("ffmpeg")) {
    try {
      run("ffmpeg", [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        inputFile,
        "-frames:v",
        "1",
        outputFile,
      ]);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Could not convert ${publicRelative(inputFile)} to WebP. Install sharp with HEIC support, sips, or ffmpeg.` +
      (lastError ? ` Last error: ${lastError.message}` : "")
  );
}

function convertMov(inputFile, outputFile) {
  if (!hasCommand("ffmpeg")) {
    throw new Error(
      `Could not convert ${publicRelative(inputFile)} to MP4. Install ffmpeg.`
    );
  }

  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    inputFile,
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputFile,
  ]);
}

const files = walk(PUBLIC_DIR).sort();
const manifest = {};
let converted = 0;
let cached = 0;

for (const inputFile of files) {
  const inputRel = publicRelative(inputFile);
  const outputRel = outputRelative(inputRel, fileHash(inputFile));
  const outputFile = join(PUBLIC_DIR, outputRel);

  manifest[inputRel] = outputRel;
  mkdirSync(dirname(outputFile), { recursive: true });

  if (existsSync(outputFile)) {
    cached++;
    continue;
  }

  if (HEIC_RE.test(inputFile)) await convertHeic(inputFile, outputFile);
  else if (MOV_RE.test(inputFile)) convertMov(inputFile, outputFile);
  converted++;
}

writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `convert-media: ${converted} converted, ${cached} cached -> ${relative(
    ROOT,
    MANIFEST_FILE
  )}`
);
