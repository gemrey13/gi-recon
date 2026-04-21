import MenuBar from "@renderer/components/ui/MenuBar";
import { Activity, useState } from "react";
import { Outlet } from "react-router-dom";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarRightCollapse } from "react-icons/tb";
import SideBar from "@renderer/components/ui/Sidebar";

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  return (
    <>
      <MenuBar />
      <div className="flex h-[calc(100vh-32px)] bg-slate-50 text-slate-900 overflow-hidden font-sans relative">
        <div
          className={`h-full transition-all duration-500 ease-ease-[cubic-bezier(0.25,0.8,0.25,1)] ${showSidebar ? "w-64" : "w-0"}`}>
          <div
            className={`h-full w-64 transform transition-transform duration-500 ease-in-out ${
              showSidebar ? "translate-x-0" : "-translate-x-full"
            }`}>
            <Activity mode={showSidebar ? "visible" : "hidden"}>
              <SideBar />
            </Activity>
          </div>
        </div>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-auto relative">
          <button
            onClick={toggleSidebar}
            className={`
              top-10 z-50 
              flex items-center justify-center
              w-8 h-8 p-1 m-2
              bg-white border border-slate-200 rounded-full shadow-sm
              hover:shadow-md hover:scale-110 active:scale-95
              transition-all duration-300 ease-in-out left-2
            `}>
            <div className="text-slate-500 hover:text-indigo-600 transition-colors">
              {showSidebar ? (
                <TbLayoutSidebarLeftCollapse size={20} />
              ) : (
                <TbLayoutSidebarRightCollapse size={20} />
              )}
            </div>
          </button>

          <div className="px-6 py-4">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default MainLayout;
