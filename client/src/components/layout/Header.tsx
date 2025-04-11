import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Menu, 
  Search, 
  Bell, 
  Settings,
  X,
  LogOut,
  User,
  UserCircle,
  UserCog
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { UserProfileDialog } from "../user/UserProfileDialog";

export const Header = () => {
  const [searchValue, setSearchValue] = useState("");
  const { currentUser, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-4 text-gray-500">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg w-64 focus-visible:ring-gray-200 transition-all focus-visible:ring-2"
              placeholder="Search for leads, contacts..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchValue("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-700">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs text-white flex items-center justify-center">3</span>
          </Button>

          
          <div className="hidden md:flex items-center gap-3" data-component-name="Header">
            <Avatar className="w-8 h-8 mr-2 cursor-pointer" onClick={() => setProfileDialogOpen(true)}>
              {currentUser?.avatar ? (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium" data-component-name="Header">{currentUser?.name || 'User'}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              onClick={() => {
                logout();
                setLocation('/login');
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs">Logout</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* User Profile Dialog */}
      <UserProfileDialog 
        open={profileDialogOpen} 
        onOpenChange={setProfileDialogOpen} 
      />
    </header>
  );
};

export default Header;
