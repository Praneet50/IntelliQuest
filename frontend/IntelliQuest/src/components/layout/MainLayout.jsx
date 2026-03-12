import Sidebar from "../sidebar/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-base-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-base-100">{children}</main>
    </div>
  );
};

export default MainLayout;
