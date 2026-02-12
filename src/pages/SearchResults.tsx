import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useMovies } from "@/contexts/MovieContext";
import LuoFilmHeader from "@/components/MovieBoxHeader";
import LuoFilmSidebar from "@/components/MovieBoxSidebar";
import MovieCard from "@/components/MovieCard";
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const SearchResults = () => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { searchContent } = useMovies();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const results = searchContent(query);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background">
      <LuoFilmHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <LuoFilmSidebar isOpen={sidebarOpen} />
      <main className={`pt-14 transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-48" : "ml-0"}`}>
        <div className="p-4 md:p-6 pb-24 md:pb-6">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              Results for "{query}"
            </h1>
            <span className="text-sm text-muted-foreground">({results.length} found)</span>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
              {results.map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-foreground text-lg mb-1">No results found</p>
              <p className="text-muted-foreground text-sm">Try searching for something else</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
