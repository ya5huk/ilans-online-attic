interface HeaderProps {
  children: React.ReactNode;
}

const SubheaderText: React.FC<HeaderProps> = ({ children }) => {
  return <h3 className="text-3xl font-bold my-1">{children}</h3>;
};

export default SubheaderText;
