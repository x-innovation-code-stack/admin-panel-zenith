
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  LayoutDashboard,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      title: 'Users',
      icon: Users,
      href: '/users',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground relative transition-all duration-300",
        expanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 py-2 border-b border-sidebar-border">
        <div className={cn("flex items-center", !expanded && "justify-center w-full")}>
          {expanded && (
            <span className="text-xl font-bold ml-2 animate-fade-in">Admin</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {expanded ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-md py-2 px-3 text-sm transition-colors",
                location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                !expanded && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5", expanded && "mr-2")} />
              {expanded && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t border-sidebar-border">
        <Collapsible
          open={userMenuOpen && expanded}
          onOpenChange={() => expanded && setUserMenuOpen(!userMenuOpen)}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center justify-start gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-2",
                !expanded && "justify-center"
              )}
            >
              <Avatar className={cn("h-8 w-8", !expanded && "h-10 w-10 transition-all")}>
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              {expanded && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70 truncate max-w-[120px]">
                      {user?.email}
                    </p>
                  </div>
                  {userMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {expanded && (
            <CollapsibleContent className="mt-1 space-y-1">
              <Link
                to="/profile"
                className="flex items-center rounded-md py-2 px-3 text-sm hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              >
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </Link>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start py-2 px-3 text-sm hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log Out</span>
              </Button>
            </CollapsibleContent>
          )}
        </Collapsible>
        
        {!expanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="mt-2 w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut size={20} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
