export interface Movie {
  id: string;
  title: string;
  year: number;
  rating: number;
  image: string;
  category?: string;
  isTrending?: boolean;
  createdAt?: string;
  poster?: string;
  genre?: string;
  type?: "movie" | "series";
}

export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  genre: string;
  year: number;
  rating: number;
  contentId?: string;
  contentType?: "movie" | "series" | "tv-channel";
}

export const heroSlides: HeroSlide[] = [];
export const popularSeries: Movie[] = [];
export const trendingMovies: Movie[] = [];
export const nollywoodMovies: Movie[] = [];
export const animationMovies: Movie[] = [];
export const mostWatched: Movie[] = [];
