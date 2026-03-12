import SidebarHeader from "./SidebarHeader";
import NewSessionButton from "./NewSessionButton";
import HistoryList from "./HistoryList";
import UserProfile from "./UserProfile";

const Sidebar = () => {
  return (
    <div className="w-64 bg-base-200 h-screen flex flex-col border-r border-base-300">
      <SidebarHeader />
      <div className="px-4 mb-6">
        <NewSessionButton />
      </div>
      <HistoryList />
      <UserProfile />
    </div>
  );
};

export default Sidebar;
