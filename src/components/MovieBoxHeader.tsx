import { Search, Menu, Download, User, LogOut, Shield, Crown } from "lucide-react";
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";

interface LuoFilmHeaderProps {
  onToggleSidebar: () => void;
}

const LuoFilmHeader = ({ onToggleSidebar }: LuoFilmHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, isAuthenticated, isAdmin, logout, subscription } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-secondary transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <a href="/" className="flex items-center gap-2">
          <img src="https://i.postimg.cc/T2khf7dN/purple-pink-color-triangle-logo-1273375-228-removebg-preview.png" alt="LUO FILM" className="h-10 w-auto object-contain" />
          <h1 className="text-foreground font-bold text-lg hidden sm:block">
            <span className="gradient-primary-text">Luo</span> Film
          </h1>
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2 max-w-xl mx-2">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-4 rounded-full bg-secondary border-none text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </form>

        <NavLink
          to="/agent"
          className={({ isActive }) =>
            `relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all md:hidden ${
              isActive
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`
          }
        >
          <Crown className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-tight">Agent</span>
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </NavLink>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-foreground hidden sm:block max-w-[100px] truncate">
                {user?.name}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {subscription && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded gradient-primary text-primary-foreground">
                        {subscription.plan.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { navigate("/subscribe"); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Subscription
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { navigate("/admin"); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); navigate("/"); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-secondary transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Login</span>
          </button>
        )}
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
};

export default LuoFilmHeader;
