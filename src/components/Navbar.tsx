import Link from "next/link";
import HeaderText from "./text/HeaderText";
import Image from "next/image";

const Navbar: React.FC = () => {
  const linkClassname =
    "md:text-3xl px-2 py-1 transition-colors duration-100 hover:bg-[var(--third)] hover:underline rounded";
  const imageClassname =
    "md:hidden invert mx-2 hover:scale-110 transition-transform duration-200";
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
            width={1000}
            height={1000}
            className="invert h-18 w-24 md:h-24 md:w-32"
            style={{ filter: "invert(100%)" }}
          ></Image>
          <div className="flex items-center  gap-1">
            <Link href="/about">
              {/* For large screens - show text */}
              <span className={`hidden md:block ${linkClassname}`}>about</span>
              {/* For mobile - show icon */}
              <Image
                className={imageClassname}
                src="/ui/user.png"
                alt="About"
                width={20}
                height={20}
              />
            </Link>
            <p className={interpunctClassname}>·</p>
            <Link href="/pics">
              <span className={`hidden md:block ${linkClassname}`}>
                pic​tures
              </span>
              <Image
                className={imageClassname}
                src="/ui/picture-icon.png"
                alt="Pictures"
                width={20}
                height={20}
              />
            </Link>
            <p className={interpunctClassname}>·</p>

            <Link href="/projects">
              <span className={`hidden md:block ${linkClassname}`}>
                projects
              </span>
              <Image
                className={imageClassname}
                src="/ui/hammer.png"
                alt="Projects"
                width={20}
                height={20}
              />
            </Link>
            <p className={interpunctClassname}>·</p>

            <Link href="/yap">
              <span className={`hidden md:block ${linkClassname}`}>yap</span>
            </Link>
            <Image
              className={imageClassname}
              src="/ui/newspaper.png"
              alt="Blog"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
