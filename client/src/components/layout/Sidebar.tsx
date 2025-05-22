import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCog,
  KeyRound,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from '@/assets/Logo.png';

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
};

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center py-3 px-4 rounded-lg transition-all duration-200 cursor-pointer",
        active 
          ? "bg-gradient-to-r from-[rgba(94,252,232,0.1)] to-[rgba(115,110,254,0.1)] border-l-3 border-[#736efe]" 
          : "hover:bg-[rgba(245,245,245,0.8)]"
      )}>
        <div className={cn("w-6 text-center", active ? "text-[#736efe]" : "text-gray-500")}>
          {icon}
        </div>
        <span className="ml-3">{label}</span>
      </div>
    </Link>
  );
};

export const Sidebar = () => {
  const [location] = useLocation();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const isAdmin = currentUser?.role === "Administrator";

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: t('nav.dashboard'), href: "/" },
    { icon: <Users size={18} />, label: t('nav.leads'), href: "/leads" },
    { icon: <UserCog size={18} />, label: t('nav.users'), href: "/users" },
  ];
  
  // API Menu items (Admin only)
  const apiMenuItems = isAdmin ? [
    { icon: <KeyRound size={18} />, label: t('nav.api.management'), href: "/api-management" },
    { icon: <FileText size={18} />, label: t('nav.api.docs'), href: "/api-documentation" },
  ] : [];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 h-screen">
      <div className="flex items-center mb-8 p-2">
        <img 
          src={logo} 
          alt="LeadFlow Logo" 
          className="h-10 w-auto mr-3 object-contain"
        />
        <h1 className="font-heading font-bold text-xl bg-gradient-to-r from-[#5efce8] to-[#736efe] bg-clip-text text-transparent">
          LeadFlow
        </h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={location === item.href}
          />
        ))}
      </nav>
      
      {apiMenuItems.length > 0 && (
        <>
          <div className="mt-6 mb-2">
            <div className="px-4 py-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('nav.api')}
              </h3>
            </div>
          </div>
          <nav className="space-y-2">
            {apiMenuItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={location === item.href}
              />
            ))}
          </nav>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
