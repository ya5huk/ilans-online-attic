import { DM_Serif_Text } from "next/font/google";

interface HeaderProps {
  children: React.ReactNode;
  disableunderline?: boolean;
  centertext?: boolean;
}

const dmSerif = DM_Serif_Text({
  subsets: ["latin"],
  weight: "400",
});

const HeaderText: React.FC<HeaderProps> = ({
  children,
  disableunderline,
  centertext,
}) => {
  return (
    <div className={`flex ${centertext ? "justify-center" : ""}`}>
      <h1
        className={`text-5xl border-[var(--secondary)] font-bold w-fit mb-2 ${
          dmSerif.className
        } ${disableunderline ? "border-b-0" : "border-b-4"}`}
      >
        {children}
      </h1>
    </div>
  );
};

export default HeaderText;
