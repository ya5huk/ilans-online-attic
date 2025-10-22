import Image from "next/image";
import { DM_Serif_Text } from "next/font/google";

const dmSerif = DM_Serif_Text({
  subsets: ["latin"],
  weight: "400",
});

const PicCard: React.FC<{
  title: string;
  imagesrc: string;
  desc: string;
  date: string;
}> = ({ title, imagesrc, desc, date }) => {
  return (
    <div className="flex flex-col justify-center border-b border-[var(--third)] space-y-3">
      <h3 className={`${dmSerif.className} text-3xl mt-2`}>{title}</h3>
      <p>{desc}</p>
      <img src={imagesrc} alt={desc} className="w-full h-auto image-shadow" />
      <p className="italic text-right mb-2">{date}</p>
    </div>
  );
};

export default PicCard;
