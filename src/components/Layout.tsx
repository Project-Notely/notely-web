import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Enhanced Canvas" },
    { path: "/simple", label: "Simple Canvas" },
    { path: "/editor", label: "Text Editor" },
    { path: "/annotated", label: "Annotated Editor" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className='min-h-screen flex flex-col bg-neutral-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-neutral-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <Link
                to='/'
                className='text-xl font-family-heading text-primary-600'
              >
                Notely
              </Link>
            </div>

            <nav className='flex space-x-8'>
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-primary-100 text-primary-700"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1'>{children}</main>

      {/* Footer */}
      <footer className='bg-white border-t border-neutral-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='text-center text-sm text-neutral-500'>
            © 2024 Notely. Built with React, TypeScript, and Tailwind CSS.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
