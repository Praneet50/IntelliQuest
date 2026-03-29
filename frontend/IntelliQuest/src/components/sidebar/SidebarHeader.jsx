import logo from "../../assets/logo.png";

const SidebarHeader = () => {
  return (
    <div className="flex items-center gap-3 p-6">
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-base-100 border border-base-300 flex items-center justify-center">
        <img
          src={logo}
          alt="IntelliQuest logo"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h1 className="text-xl font-bold text-base-content">IntelliQuest</h1>
        <p className="text-xs text-primary uppercase tracking-wider">
          AI Question Generator
        </p>
      </div>
    </div>
  );
};

export default SidebarHeader;
