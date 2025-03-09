import { ReactNode, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

interface PageLayoutProps {
  children: ReactNode;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export default function PageLayout({ children, isMobileOpen, setIsMobileOpen }: PageLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar setIsMobileOpen={setIsMobileOpen} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
