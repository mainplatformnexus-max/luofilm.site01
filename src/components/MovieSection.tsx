import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import type { Movie } from "@/data/movies";

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  moreLink?: string;
}

const MovieSection = ({ title, movies, moreLink = "/movies" }: MovieSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
    setTimeout(updateScrollState, 350);
  };

  return (
    <section className="mb-6 md:mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-bold text-base md:text-lg">
          {title}
        </h3>
        <Link
          to={moreLink}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span>More</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="relative group/section">
        {/* Scroll left button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-8 z-10 w-10 bg-gradient-to-r from-background to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/section:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <div className="w-8 h-8 rounded-full bg-secondary/80 backdrop-blur-sm flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </div>
          </button>
        )}

        {/* Movies scroll container */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-2"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-[calc(33.33%-6px)] sm:w-[calc(25%-6px)] md:w-[calc(20%-8px)] lg:w-[calc(14.28%-10px)]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Scroll right button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-8 z-10 w-10 bg-gradient-to-l from-background to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/section:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <div className="w-8 h-8 rounded-full bg-secondary/80 backdrop-blur-sm flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-foreground" />
            </div>
          </button>
        )}
      </div>
    </section>
  );
};

export default MovieSection;
