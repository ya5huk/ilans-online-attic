interface HeaderProps {
  children: React.ReactNode;
  disableunderline?: boolean;
  centertext?: boolean;
}

const HeaderText: React.FC<HeaderProps> = ({
  children,
  disableunderline,
  centertext,
}) => {
  return (
    <div className={`flex ${centertext ? "justify-center" : ""}`}>
      <h1
        className={`text-5xl border-[var(--third)] font-bold w-fit mb-2 font-dm-serif ${
          disableunderline ? "border-b-0" : "border-b-4"
        }`}
      >
        {children}
      </h1>
    </div>
  );
};

export default HeaderText;
