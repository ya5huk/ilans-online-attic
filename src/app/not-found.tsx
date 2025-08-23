import HeaderText from "@/components/text/HeaderText";

const NotFound: React.FC = () => {
  return (
    <div>
      <HeaderText>404 - Not Found</HeaderText>
      <p className="text-xl">The page you are looking for does not exist.</p>
      <p className="text-xl">Use the navbar to get back en route.</p>
    </div>
  );
};

export default NotFound;
