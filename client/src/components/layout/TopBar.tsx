import { useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { UserProfile } from '@/lib/types';

interface TopBarProps {
  setIsMobileOpen: (isOpen: boolean) => void;
}

export default function TopBar({ setIsMobileOpen }: TopBarProps) {
  const { data: user } = useQuery<UserProfile>({ 
    queryKey: ['/api/user/profile'],
  });

  const openMobileSidebar = () => {
    setIsMobileOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <div className="flex items-center md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={openMobileSidebar}
          className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <span className="ml-3 text-xl font-bold text-primary-500 md:hidden">LifeHub</span>
      </div>

      <div className="hidden md:flex md:flex-1 md:px-4">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative p-0 flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://randomuser.me/api/portraits/women/62.jpg" alt="User profile" />
                <AvatarFallback>{user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="hidden md:block font-medium text-sm">
                {user?.displayName || user?.username || 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
