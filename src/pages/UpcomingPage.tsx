import { useState, useEffect } from "react";
import LuoFilmHeader from "@/components/MovieBoxHeader";
import LuoFilmSidebar from "@/components/MovieBoxSidebar";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useMovies } from "@/contexts/MovieContext";
import MovieCard from "@/components/MovieCard";
import { useIsMobile } from "@/hooks/use-mobile";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const UpcomingPage = () => {
  const isMobile = useIsMobile();
  const { movies } = useMovies();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1)); // Feb 2026

  // Movies that are Agent Exclusive but NOT published are considered "Upcoming" for normal users
  const agentMovies = movies.filter(m => m.isAgent && !m.isPublished);
  const allUpcoming = [...agentMovies];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  
  const getDayReleases = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allUpcoming.filter((r) => r.uploadedAt?.startsWith(dateStr));
  };

  const releasesThisMonth = allUpcoming.filter((r) => r.uploadedAt?.startsWith(monthStr));

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1));

  return (
    <div className="min-h-screen bg-background">
      <LuoFilmHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <LuoFilmSidebar isOpen={sidebarOpen} />
      <main className={`pt-14 transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-48" : "ml-0"}`}>
        <div className="p-4 md:p-6 pb-24 md:pb-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Upcoming Releases</h1>
          </div>

          {/* Calendar */}
          <div className="bg-card rounded-2xl border border-border p-4 md:p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <h2 className="text-lg font-bold text-foreground">
                {MONTHS[month]} {year}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const releases = getDayReleases(day);
                const hasRelease = releases.length > 0;
                return (
                  <div
                    key={day}
                    className={`relative text-center py-2 rounded-lg text-sm cursor-default transition-colors ${
                      hasRelease
                        ? "gradient-primary text-primary-foreground font-bold"
                        : "text-foreground hover:bg-secondary"
                    }`}
                    title={hasRelease ? releases.map((r) => r.title).join(", ") : undefined}
                  >
                    {day}
                    {hasRelease && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Release list Grid */}
          <h2 className="text-lg font-bold text-foreground mb-4">
            Releases in {MONTHS[month]}
          </h2>
          {releasesThisMonth.length === 0 ? (
            <p className="text-muted-foreground text-sm">No releases scheduled for this month</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {releasesThisMonth.map((movie) => (
                <MovieCard key={movie.id} movie={movie} isUpcoming={true} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UpcomingPage;
