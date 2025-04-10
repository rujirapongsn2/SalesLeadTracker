import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart,
  Settings,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
};

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center py-3 px-4 rounded-lg transition-all duration-200",
        active 
          ? "bg-gradient-to-r from-[rgba(94,252,232,0.1)] to-[rgba(115,110,254,0.1)] border-l-3 border-[#736efe]" 
          : "hover:bg-[rgba(245,245,245,0.8)]"
      )}>
        <div className={cn("w-6 text-center", active ? "text-[#736efe]" : "text-gray-500")}>
          {icon}
        </div>
        <span className="ml-3">{label}</span>
      </a>
    </Link>
  );
};

export const Sidebar = () => {
  const [location] = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: "/" },
    { icon: <Users size={18} />, label: "Leads", href: "/leads" },
    { icon: <CheckSquare size={18} />, label: "Tasks", href: "/tasks" },
    { icon: <BarChart size={18} />, label: "Reports", href: "/reports" },
    { icon: <Settings size={18} />, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 h-screen">
      <div className="flex items-center mb-8 p-2">
        <div className="w-10 h-10 bg-gradient-to-r from-[#5efce8] to-[#736efe] flex items-center justify-center rounded-lg mr-3">
          <span className="text-white font-bold text-lg">SL</span>
        </div>
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
      
      <div className="mt-auto">
        <div className="rounded-xl bg-gradient-to-r from-[rgba(67,233,123,0.1)] to-[rgba(56,249,215,0.1)] p-4 mb-4">
          <p className="font-medium text-sm mb-2">Upgrade to Pro</p>
          <p className="text-xs mb-3">Get advanced features and analytics</p>
          <Button variant="outline" size="sm" className="w-full bg-white">
            Learn More <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="flex items-center p-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
            {/* Avatar placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
              AM
            </div>
          </div>
          <div className="ml-3">
            <p className="font-medium text-sm">Alex Morgan</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
