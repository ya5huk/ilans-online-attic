import Image from "next/image";
import SubheaderText from "../text/SubheaderText";

const PicCard: React.FC<{
  title: string;
  imagesrc: string;
  desc: string;
  date: string;
}> = ({ title, imagesrc, desc, date }) => {
  return (
    <div className="flex flex-col justify-center border-b-4 border-[var(--third)] p-4">
      <h3 className="text-3xl">{title}</h3>
      <p className="font-default" style={{}}>
        {desc}
      </p>
      <img src={imagesrc} alt={desc} className="w-full h-auto" />
      <p className="text-right">{date}</p>
    </div>
  );
};

export default PicCard;
