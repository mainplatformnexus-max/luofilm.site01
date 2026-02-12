import {
  Home,
  Tv,
  Film,
  Crown,
  Calendar,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const sidebarNav = [
  { label: "Home", icon: Home, href: "/" },
  { label: "TV Show", icon: Tv, href: "/tv-shows" },
  { label: "Movie", icon: Film, href: "/movies" },
  { label: "TV CHANNEL", icon: Tv, href: "/tv-channels" },
  { label: "Agent 🔥", icon: Crown, href: "/agent" },
  { label: "Upcoming", icon: Calendar, href: "/upcoming" },
];

interface LuoFilmSidebarProps {
  isOpen: boolean;
}

const LuoFilmSidebar = ({ isOpen }: LuoFilmSidebarProps) => {
  return (
    <aside
      className={`fixed top-14 left-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-y-auto scrollbar-hide hidden md:block ${
        isOpen ? "w-48" : "w-0 -translate-x-full"
      }`}
    >
      <nav className="flex flex-col gap-1 p-3 pt-4">
        {sidebarNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "gradient-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 mt-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground px-3 mt-3">
          luofilm.ug@luofilm.ug
        </p>
      </div>
    </aside>
  );
};

export default LuoFilmSidebar;
