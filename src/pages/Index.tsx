import { useState, useEffect } from "react";
import LuoFilmHeader from "@/components/MovieBoxHeader";
import LuoFilmSidebar from "@/components/MovieBoxSidebar";
import HeroCarousel from "@/components/HeroCarousel";
import MovieSection from "@/components/MovieSection";
import { useMovies } from "@/contexts/MovieContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { movies, series } = useMovies();
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAppPromo, setShowAppPromo] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      sessionStorage.setItem("hasSeenWelcome", "true");
      // Auto-exit after 15 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 15000);
      return () => clearTimeout(timer);
    }

    const hasSeenAppPromo = localStorage.getItem("hasSeenAppPromo");
    if (!hasSeenAppPromo && isMobile) {
      setTimeout(() => setShowAppPromo(true), 3000);
    }
  }, [isMobile]);

  const welcomeImage = localStorage.getItem("welcome_image") || "https://i.postimg.cc/T2khf7dN/purple-pink-color-triangle-logo-1273375-228-removebg-preview.png";
  const ctaLink = localStorage.getItem("welcome_cta_link") || "/movies";

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleInstallApp = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowAppPromo(false);
        localStorage.setItem("hasSeenAppPromo", "true");
      }
    } else {
      alert("To install: Tap the share button and select 'Add to Home Screen'");
    }
  };

  const publishedMovies = movies.filter((m) => m.isPublished !== false && !m.isAgent);
  const publishedSeries = series.filter((s) => s.isPublished !== false);

  const trendingMovies = publishedMovies.slice(0, 10);
  const actionMovies = publishedMovies.filter((m) => m.genre?.includes("Action")).slice(0, 10);
  const animationMovies = publishedMovies.filter((m) => m.genre?.includes("Animation")).slice(0, 10);
  const mostWatched = [...publishedMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <LuoFilmHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <LuoFilmSidebar isOpen={sidebarOpen} />

      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-none animate-in fade-in duration-500">
          <div className="relative max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group bg-transparent">
            <button 
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-video">
              <img src={welcomeImage} alt="Welcome" className="w-full h-full object-cover rounded-2xl" />
              <div className="absolute inset-0 flex items-end justify-start p-6 bg-transparent">
                <Button 
                  onClick={() => {
                    setShowWelcome(false);
                    navigate(ctaLink);
                  }}
                  size="sm"
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-primary hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                >
                  {localStorage.getItem("welcome_cta_text") || "Explore Now"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAppPromo && (
        <div className="fixed top-16 inset-x-4 z-50 flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-2xl shadow-2xl animate-in slide-in-from-top-full duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm">Download Our App</p>
              <p className="text-xs opacity-90 font-medium">Get the best experience on mobile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleInstallApp} className="rounded-xl font-bold px-4">
              Install
            </Button>
            <button onClick={() => setShowAppPromo(false)} className="p-1 opacity-70 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main
        className={`pt-14 transition-all duration-300 ${
          sidebarOpen && !isMobile ? "ml-48" : "ml-0"
        }`}
      >
        <div className="p-4 md:p-6">
          <HeroCarousel />

          <div className="mt-6 md:mt-8 space-y-8">
            {publishedSeries.length > 0 && (
              <MovieSection title="Popular Series" movies={publishedSeries} moreLink="/tv-shows" />
            )}
            {trendingMovies.length > 0 && (
              <MovieSection title="Trending Movies" movies={trendingMovies} moreLink="/movies" />
            )}
            {actionMovies.length > 0 && (
              <MovieSection title="Action" movies={actionMovies} moreLink="/movies" />
            )}
            {animationMovies.length > 0 && (
              <MovieSection title="Animation" movies={animationMovies} moreLink="/movies" />
            )}
            {mostWatched.length > 0 && (
              <MovieSection title="Most Watched" movies={mostWatched} moreLink="/movies" />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
