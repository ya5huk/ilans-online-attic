// Build-time media converter for iPhone originals.
//
// Local /public HEIC/HEIF and MOV files are converted into browser-friendly
// siblings under /public/_generated/media. Local videos also get poster images
// under /public/_generated/posters, so iOS Safari has a visible preview before
// playback. Manifests map the original authoring path to the generated paths.

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
const GENERATED_MEDIA_REL = "_generated/media";
const GENERATED_POSTER_REL = "_generated/posters";
const CONVERSIONS_FILE = join(ROOT, "src", "lib", "mediaConversions.json");
const POSTERS_FILE = join(ROOT, "src", "lib", "mediaPosters.json");

const CONVERTIBLE_RE = /\.(heic|heif|mov)$/i;
const HEIC_RE = /\.(heic|heif)$/i;
const MOV_RE = /\.mov$/i;
const VIDEO_RE = /\.(mp4|webm|mov)$/i;
const MEDIA_RE = /\.(heic|heif|mp4|webm|mov)$/i;

let sharpModule;

function walk(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store") continue;
    const full = join(dir, name);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (relative(PUBLIC_DIR, full).split(sep).join("/") === "_generated")
        continue;
      found.push(...walk(full));
    } else if (MEDIA_RE.test(name)) {
      found.push(full);
    }
  }
  return found;
}

function publicRelative(file) {
  return relative(PUBLIC_DIR, file).split(sep).join("/");
}

function fileHash(file) {
  return createHash("sha256")
    .update(readFileSync(file))
    .digest("hex")
    .slice(0, 12);
}

function convertedRelative(inputRel, hash) {
  const ext = extname(inputRel);
  const stem = inputRel.slice(0, -ext.length);
  return `${GENERATED_MEDIA_REL}/${stem}.${hash}${
    HEIC_RE.test(ext) ? ".webp" : ".mp4"
  }`;
}

function posterRelative(inputRel, hash) {
  const ext = extname(inputRel);
  const stem = inputRel.slice(0, -ext.length);
  return `${GENERATED_POSTER_REL}/${stem}.${hash}.jpg`;
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

function createPoster(inputFile, outputFile) {
  if (!hasCommand("ffmpeg")) {
    throw new Error(
      `Could not create poster for ${publicRelative(inputFile)}. Install ffmpeg.`
    );
  }

  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    "0.1",
    "-i",
    inputFile,
    "-frames:v",
    "1",
    "-vf",
    "scale=w=1280:h=1280:force_original_aspect_ratio=decrease",
    "-q:v",
    "3",
    outputFile,
  ]);
}

const files = walk(PUBLIC_DIR).sort();
const conversionManifest = {};
const posterManifest = {};
let converted = 0;
let cached = 0;
let posters = 0;
let cachedPosters = 0;

for (const inputFile of files) {
  const inputRel = publicRelative(inputFile);
  const hash = fileHash(inputFile);

  if (CONVERTIBLE_RE.test(inputFile)) {
    const outputRel = convertedRelative(inputRel, hash);
    const outputFile = join(PUBLIC_DIR, outputRel);

    conversionManifest[inputRel] = outputRel;
    mkdirSync(dirname(outputFile), { recursive: true });

    if (existsSync(outputFile)) {
      cached++;
    } else {
      if (HEIC_RE.test(inputFile)) await convertHeic(inputFile, outputFile);
      else if (MOV_RE.test(inputFile)) convertMov(inputFile, outputFile);
      converted++;
    }
  }

  if (VIDEO_RE.test(inputFile)) {
    const posterRel = posterRelative(inputRel, hash);
    const posterFile = join(PUBLIC_DIR, posterRel);

    posterManifest[inputRel] = posterRel;
    mkdirSync(dirname(posterFile), { recursive: true });

    if (existsSync(posterFile)) {
      cachedPosters++;
    } else {
      createPoster(inputFile, posterFile);
      posters++;
    }
  }
}

writeFileSync(
  CONVERSIONS_FILE,
  JSON.stringify(conversionManifest, null, 2) + "\n"
);
writeFileSync(POSTERS_FILE, JSON.stringify(posterManifest, null, 2) + "\n");
console.log(
  `convert-media: ${converted} converted, ${cached} cached -> ${relative(
    ROOT,
    CONVERSIONS_FILE
  )}; ${posters} posters, ${cachedPosters} cached -> ${relative(
    ROOT,
    POSTERS_FILE
  )}`
);
