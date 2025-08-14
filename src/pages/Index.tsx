import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Whiteboard from "@/components/Whiteboard";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isCollapsed={sidebarCollapsed} />
        <Whiteboard />
      </div>
    </div>
  );
};

export default Index;
