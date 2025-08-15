import Link from "next/link";
import HeaderText from "./text/HeaderText";
import Image from "next/image";

const Navbar: React.FC = () => {
  const linkClassname =
    "px-2 py-1 transition-colors duration-100 hover:bg-[var(--third)] hover:underline rounded";
  const interpunctClassname = "select-none";

  return (
    <div className="text-white w-full bg-[var(--secondary)] p-4 border-b-8 border-[var(--third)] font-dm-serif">
      <div className="max-w-3xl mx-auto flex items-center gap-2 justify-between py-2">
        <div className="flex items-center gap-4">
          {/* <Image
            src="/me/IMG_3463.jpg"
            alt="Me climbing on some red and white pole"
            width={100}
            height={100}
            className="rounded-full border-4 border-[var(--third)]"
          ></Image> */}
        </div>
        <div className="flex items-center w-full justify-between">
          {/* <h3 className="text-6xl">ilan.</h3> */}
          <Image
            src="/signature/2.png"
            alt="My Signature"
            width={150}
            height={60}
            className="invert"
            style={{ filter: "invert(100%)" }}
          ></Image>
          <div className="flex items-center text-3xl gap-1">
            <Link
              style={{ color: "white", fontWeight: "normal" }}
              className={linkClassname}
              href="/about"
            >
              about
            </Link>
            <p className={interpunctClassname}>·</p>
            <Link
              style={{ color: "white", fontWeight: "normal" }}
              className={linkClassname}
              href="/pics"
            >
              pic​tures
            </Link>
            <p className={interpunctClassname}>·</p>

            <Link
              style={{ color: "white", fontWeight: "normal" }}
              className={linkClassname}
              href="/projects"
            >
              projects
            </Link>
            <p className={interpunctClassname}>·</p>

            <Link
              style={{ color: "white", fontWeight: "normal" }}
              className={linkClassname}
              href="/yap"
            >
              yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
