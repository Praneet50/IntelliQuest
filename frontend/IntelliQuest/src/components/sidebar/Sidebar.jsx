import SidebarHeader from "./SidebarHeader";
import NewSessionButton from "./NewSessionButton";
import HistoryList from "./HistoryList";
import UserProfile from "./UserProfile";

const Sidebar = () => {
  return (
    <div className="w-64 bg-darker h-screen flex flex-col border-r border-gray-800/50">
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
