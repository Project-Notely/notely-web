import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className='min-h-dvh min-w-dvw bg-background-primary'>
      {/* Navigation */}
      <nav>hi</nav>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
