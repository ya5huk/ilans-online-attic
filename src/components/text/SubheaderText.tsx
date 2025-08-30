interface HeaderProps {
  children: React.ReactNode;
}

const SubheaderText: React.FC<HeaderProps> = ({ children }) => {
  return <h2 className="text-2xl font-bold my-1 ">{children}</h2>;
};

export default SubheaderText;
