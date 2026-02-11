import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Play } from "lucide-react";
import { useMovies } from "@/contexts/MovieContext";
import { useNavigate } from "react-router-dom";

const HeroCarousel = () => {
  const { heroSlides } = useMovies();
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, heroSlides.length]);

  if (heroSlides.length === 0) return null;

  const slide = heroSlides[currentSlide % heroSlides.length];

  const handleWatchNow = () => {
    if (slide.contentId) {
      if (slide.contentType === "tv-channel") {
        navigate(`/tv-channels`); // Assuming a channel listing or specific play page
      } else {
        navigate(`/play/${slide.contentId}`);
      }
    } else {
      navigate(`/play/${slide.id}`);
    }
  };

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[21/7] min-h-[200px] md:min-h-[320px] max-h-[400px] overflow-hidden rounded-xl">
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === currentSlide ? 1 : 0 }}
        >
          <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
        </div>
      ))}

      <div className="absolute inset-0 bg-black/10" />

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
        <div className="max-w-lg animate-fade-in" key={slide.id}>
          <h2 className="text-xl md:text-3xl font-bold text-white mb-4">{slide.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWatchNow}
              className="flex items-center gap-2 px-4 py-2 rounded-full gradient-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity"
            >
              <Play className="w-3 h-3 fill-current" />
              Watch Now
            </button>
            <button 
              onClick={handleWatchNow}
              className="px-4 py-2 rounded-full border border-white/30 text-white text-xs font-medium hover:bg-white/10 transition-all"
            >
              Details
            </button>
          </div>
        </div>
      </div>

      <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/70 transition-all" aria-label="Previous slide">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/70 transition-all" aria-label="Next slide">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-6 gradient-primary" : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
