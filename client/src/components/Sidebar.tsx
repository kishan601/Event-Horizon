import { Link, useLocation } from "wouter";
import { LayoutDashboard, CalendarPlus, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    // Only show create if we're not on the create modal (which is managed via state in this simple app, 
    // but here we might just have a link or a button elsewhere. Let's keep it simple.)
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border hidden md:flex flex-col z-50">
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 font-display">
          EventFlow
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage with style</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
}
