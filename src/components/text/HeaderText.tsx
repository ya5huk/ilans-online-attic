interface HeaderProps {
  children: React.ReactNode;
}

const HeaderText: React.FC<HeaderProps> = ({ children }) => {
  return (
    <h1 className="text-5xl border-b-4 border-[var(--third)] font-bold w-fit mb-2 font-dm-serif">
      {children}
    </h1>
  );
};

export default HeaderText;
