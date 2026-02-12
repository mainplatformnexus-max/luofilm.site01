import { useMovies } from "@/contexts/MovieContext";
import LuoFilmHeader from "@/components/MovieBoxHeader";
import LuoFilmSidebar from "@/components/MovieBoxSidebar";
import MovieGrid from "@/components/MovieGrid";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const MoviesPage = () => {
  const isMobile = useIsMobile();
  const { movies } = useMovies();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const published = movies.filter((m) => m.isPublished !== false && !m.isAgent);

  return (
    <div className="min-h-screen bg-background">
      <LuoFilmHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <LuoFilmSidebar isOpen={sidebarOpen} />
      <main className={`pt-14 transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-48" : "ml-0"}`}>
        <div className="p-4 md:p-6 pb-24 md:pb-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Movies</h1>
          <MovieGrid movies={published} />
          {published.length === 0 && (
            <p className="text-center text-muted-foreground mt-12">No movies available</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default MoviesPage;
