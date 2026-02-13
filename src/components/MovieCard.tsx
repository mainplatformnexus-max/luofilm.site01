import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ExtendedMovie } from "@/contexts/MovieContext";
import { useAuth } from "@/contexts/AuthContext";

interface MovieCardProps {
  movie: ExtendedMovie;
  isUpcoming?: boolean;
}

const MovieCard = ({ movie, isUpcoming }: MovieCardProps) => {
  const navigate = useNavigate();
  const { trackActivity } = useAuth();

  const handleClick = () => {
    if (isUpcoming) return;
    trackActivity("click", movie.id, movie.title);
    navigate(`/play/${movie.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex-shrink-0 w-full ${isUpcoming ? "cursor-default" : "cursor-pointer"}`}
    >
      <div className="relative w-full pb-[140%] rounded-t-lg overflow-hidden bg-card">
        <img
          src={movie.image || movie.poster}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {isUpcoming && movie.uploadedAt && (
          <div className="absolute top-1 left-1 md:top-2 md:left-2 px-1.5 py-1 rounded-lg bg-primary/90 backdrop-blur-md shadow-lg z-10">
            <p className="text-[10px] md:text-xs font-bold text-white uppercase text-center leading-none">
              Out: {new Date(movie.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        )}
        {!isUpcoming && movie.rating && (
          <div className="absolute top-1 left-1 md:top-2 md:left-2 flex items-center gap-0.5 px-1 md:px-1.5 py-0.5 rounded bg-background/70 backdrop-blur-sm">
            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-rating-star fill-current" />
            <span className="text-[10px] md:text-xs font-medium text-foreground">{movie.rating}</span>
          </div>
        )}
        {movie.type === "series" && (
          <div className="absolute top-1 right-1 md:top-2 md:right-2 px-1 md:px-1.5 py-0.5 rounded gradient-primary backdrop-blur-sm">
            <span className="text-[8px] md:text-[10px] font-semibold text-primary-foreground uppercase">Series</span>
          </div>
        )}
      </div>
      <div className="w-full flex flex-col gap-0.5 md:gap-1 bg-secondary/50 p-1 md:p-1.5 rounded-b-lg">
        <p className="text-xs md:text-sm text-foreground/80 font-normal truncate">{movie.title}</p>
        {movie.genre && (
          <p className="text-[10px] md:text-xs text-muted-foreground truncate">{movie.genre}</p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
