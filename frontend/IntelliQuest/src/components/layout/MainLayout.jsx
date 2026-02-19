import Sidebar from "../sidebar/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default MainLayout;
