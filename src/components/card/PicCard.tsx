import Image from "next/image";
import SubheaderText from "../text/SubheaderText";

const PicCard: React.FC<{
  title: string;
  imagesrc: string;
  desc: string;
  date: string;
}> = ({ title, imagesrc, desc, date }) => {
  return (
    <div className="flex flex-col justify-center">
      <h3>{title}</h3>
      <img src={imagesrc} alt={desc} className="w-full h-auto" />
      <small className="text-base font-bold  text-center p-2">{date}</small>
    </div>
  );
};

export default PicCard;
