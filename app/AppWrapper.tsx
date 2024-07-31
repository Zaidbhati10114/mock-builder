import React, { ReactNode } from "react";
import Sidebar from "./_components/Sidebar";
import MobileNav from "./_components/mobile-nav";

type AppWrapperProps = {
  children: ReactNode;
};

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col h-screen overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppWrapper;
