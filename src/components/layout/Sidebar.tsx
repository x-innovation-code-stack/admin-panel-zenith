
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
  CalendarRange,
  ChevronDown,
  ChevronRight,
  FileText,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      icon: Home,
      href: '/',
    },
    {
      title: 'Diet Plans',
      icon: FileText,
      href: '/diet-plans',
    },
    {
      title: 'Users',
      icon: Users,
      href: '/users',
    },
    {
      title: 'Calendar',
      icon: CalendarRange,
      href: '/calendar',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    },
  ];

  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map(part => part[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : 'U';
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border relative transition-all duration-300 shadow-sm z-10",
        expanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 py-2 border-b border-sidebar-border">
        <div className={cn("flex items-center", !expanded && "justify-center w-full")}>
          {expanded ? (
            <div className="flex items-center gap-2">
              <div className="text-primary font-bold text-2xl">
                ZenFit
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">Z</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
        >
          {expanded ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "sidebar-item",
                location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href))
                  ? "sidebar-item-active"
                  : "sidebar-item-inactive",
                !expanded && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-5 w-5", !expanded && "mx-auto")} />
              {expanded && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      
      <div className="p-3 border-t border-sidebar-border mt-auto">
        <Collapsible
          open={userMenuOpen && expanded}
          onOpenChange={() => expanded && setUserMenuOpen(!userMenuOpen)}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center justify-start gap-2 rounded-md p-2 hover:bg-secondary/70",
                !expanded && "justify-center"
              )}
            >
              <Avatar className={cn("h-8 w-8 border-2 border-white", !expanded && "h-10 w-10 transition-all")}>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              {expanded && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || 'Administrator'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70 truncate max-w-[120px]">
                      {user?.email || 'admin@example.com'}
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
                className="flex items-center rounded-md py-2 px-3 text-sm hover:bg-secondary/50 hover:text-primary"
              >
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </Link>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start py-2 px-3 text-sm hover:bg-secondary/50 hover:text-primary"
                onClick={logout || (() => {})}
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
            onClick={logout || (() => {})}
            className="mt-2 w-full text-sidebar-foreground hover:bg-secondary/70 hover:text-primary"
          >
            <LogOut size={18} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
