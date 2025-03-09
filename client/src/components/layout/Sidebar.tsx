import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import useDarkMode from '@/hooks/useDarkMode';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  BookOpen, 
  Wrench, 
  Users2, 
  Settings, 
  Moon,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [location] = useLocation();
  const { toggleDarkMode } = useDarkMode();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 mr-3" /> },
    { path: '/tasks', label: 'Tasks & Goals', icon: <CheckSquare className="h-5 w-5 mr-3" /> },
    { path: '/calendar', label: 'Calendar', icon: <Calendar className="h-5 w-5 mr-3" /> },
    { path: '/budget', label: 'Budget', icon: <DollarSign className="h-5 w-5 mr-3" /> },
    { path: '/habits', label: 'Habits', icon: <TrendingUp className="h-5 w-5 mr-3" /> },
    { path: '/contacts', label: 'Contacts', icon: <Users className="h-5 w-5 mr-3" /> },
    { path: '/documents', label: 'Documents', icon: <FileText className="h-5 w-5 mr-3" /> },
    { path: '/journal', label: 'Journal', icon: <BookOpen className="h-5 w-5 mr-3" /> },
    { path: '/tools', label: 'Tools', icon: <Wrench className="h-5 w-5 mr-3" /> },
    { path: '/community', label: 'Community', icon: <Users2 className="h-5 w-5 mr-3" /> },
  ];

  const closeMobileSidebar = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:sticky top-0 left-0 h-full md:h-screen z-50 transition-transform transform-gpu duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col w-64 h-full border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-500">LifeHub</span>
            </div>
            <button 
              className="md:hidden text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              onClick={closeMobileSidebar}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
            <nav className="flex-1 space-y-2">
              {navItems.map(item => (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  onClick={closeMobileSidebar}
                  className={cn(
                    "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg",
                    isActive(item.path) 
                      ? "bg-primary-50 dark:bg-primary-900 text-primary-500 dark:text-primary-300" 
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
              <Link 
                href="/settings" 
                onClick={closeMobileSidebar}
                className={cn(
                  "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg",
                  isActive('/settings') 
                    ? "bg-primary-50 dark:bg-primary-900 text-primary-500 dark:text-primary-300" 
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                )}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Link>
              <button 
                onClick={toggleDarkMode} 
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <Moon className="h-5 w-5 mr-3" />
                Dark Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
