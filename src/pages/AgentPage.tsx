import { useMovies } from "@/contexts/MovieContext";
import { useAuth } from "@/contexts/AuthContext";
import LuoFilmHeader from "@/components/MovieBoxHeader";
import LuoFilmSidebar from "@/components/MovieBoxSidebar";
import MovieGrid from "@/components/MovieGrid";
import { useState, useEffect } from "react";
import { Crown, Lock } from "lucide-react";
import SubscriptionModal from "@/components/SubscriptionModal";
import LoginModal from "@/components/LoginModal";
import { useIsMobile } from "@/hooks/use-mobile";

const AgentPage = () => {
  const isMobile = useIsMobile();
  const { movies } = useMovies();
  const { hasAgentAccess, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Agent movies: latest uploaded + agent-exclusive content
  const agentMovies = movies
    .filter((m) => m.isAgent || !m.isPublished)
    .sort((a, b) => new Date(b.uploadedAt || "").getTime() - new Date(a.uploadedAt || "").getTime());

  // Also show recently uploaded movies
  const latestUploaded = movies
    .sort((a, b) => new Date(b.uploadedAt || "").getTime() - new Date(a.uploadedAt || "").getTime())
    .slice(0, 20);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <LuoFilmHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <LuoFilmSidebar isOpen={sidebarOpen} />
        <main className={`pt-14 transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-48" : "ml-0"}`}>
          <div className="flex items-center justify-center min-h-[60vh] pb-24 md:pb-0">
            <div className="text-center p-8">
              <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-4">Please login to access Agent content</p>
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="px-6 py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm"
              >
                Login
              </button>
            </div>
          </div>
        </main>
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </div>
    );
  }

  if (!hasAgentAccess) {
    return (
      <div className="min-h-screen bg-background">
        <LuoFilmHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <LuoFilmSidebar isOpen={sidebarOpen} />
        <main className={`pt-14 transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-48" : "ml-0"}`}>
          <div className="flex items-center justify-center min-h-[60vh] pb-24 md:pb-0">
            <div className="text-center p-8 max-w-md">
              <Crown className="w-14 h-14 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Agent Access Required</h2>
              <p className="text-muted-foreground mb-2">
                Get early access to the latest movies before they're published to everyone.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Agent subscribers receive movies as soon as they're uploaded, before public release.
              </p>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="px-8 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Get Agent Plan
              </button>
            </div>
          </div>
        </main>
        <SubscriptionModal 
          isOpen={showSubscriptionModal} 
          onClose={() => setShowSubscriptionModal(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LuoFilmHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <LuoFilmSidebar isOpen={sidebarOpen} />
      <main className={`pt-14 transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-48" : "ml-0"}`}>
        <div className="p-4 md:p-6 pb-24 md:pb-6">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-foreground">Agent - Early Access</h1>
          </div>

          {agentMovies.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-foreground mb-4">🔥 Agent Exclusive</h2>
              <MovieGrid movies={agentMovies} />
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">📽 Latest Uploads</h2>
            <MovieGrid movies={latestUploaded} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentPage;
