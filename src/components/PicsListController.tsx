"use client";

import { useState } from "react";
import PicCard from "./card/PicCard";
import { DM_Serif_Text } from "next/font/google";

const dmSerif = DM_Serif_Text({
  subsets: ["latin"],
  weight: "400",
});

interface PicInfo {
  title: string;
  description: string;
  image: string;
  date: string;
}

const PicsListController: React.FC<{ picList: PicInfo[] }> = ({ picList }) => {
  const [shownPicsCount, setShownPicsCount] = useState(5);

  return (
    <div className="flex flex-col justify-center">
      {picList.slice(0, shownPicsCount).map((p, index) => (
        <PicCard
          title={p.title}
          imagesrc={p.image}
          desc={p.description}
          date={p.date}
          key={index}
        />
      ))}
      {shownPicsCount < picList.length && (
        <button
          className={`${dmSerif.className} tracking-widest bg-[var(--secondary)] border border-[var(--third)] image-shadow p-2 hover:opacity-80 hover:cursor-pointer text-white my-5`}
          onClick={() => setShownPicsCount(shownPicsCount + 5)}
        >
          load another 5
        </button>
      )}
    </div>
  );
};

export default PicsListController;
