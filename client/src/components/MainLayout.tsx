import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="max-w-[1920px] mx-auto bg-noct-black min-h-screen">
      {children}
    </div>
  );
}

export default MainLayout;