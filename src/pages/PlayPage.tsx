import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMovies } from "@/contexts/MovieContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Lock } from "lucide-react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import * as dashjs from "dashjs";
import SubscriptionModal from "@/components/SubscriptionModal";
import LoginModal from "@/components/LoginModal";
import { Skeleton } from "@/components/ui/skeleton";
import MovieDetailsPanel from "@/components/play/MovieDetailsPanel";
import SeriesEpisodesPanel from "@/components/play/SeriesEpisodesPanel";
import PlayerActions from "@/components/play/PlayerActions";
import { getPlayableVideoUrl } from "@/lib/videoProxy";
import MovieCard from "@/components/MovieCard";

const PlayPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { movies, series, episodes, loading } = useMovies();
  const { isAuthenticated, hasNormalAccess, hasAgentAccess } = useAuth();
  const artRef = useRef<HTMLDivElement>(null);
  const artInstance = useRef<Artplayer | null>(null);
  const [relatedContent, setRelatedContent] = useState<typeof movies>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const allContent = [...movies, ...series];
  const content = allContent.find((m) => m.id === id);
  // Ensure we check seriesId against content.id correctly
  const contentEpisodes = content && (content.type === "series" || series.some(s => s.id === content.id)) 
    ? episodes.filter((e) => String(e.seriesId) === String(id)) 
    : [];

  // Check access
  const needsAgent = content?.isAgent && !content?.isPublished;
  const isLocked = needsAgent ? !hasAgentAccess : !hasNormalAccess;

  const isSeries = content?.type === "series" || contentEpisodes.length > 0;

  const selectedEpisodeObj = isSeries
    ? contentEpisodes.find((e) => e.id === selectedEpisode) ?? contentEpisodes[0]
    : null;
  const activeVideoUrl = (selectedEpisodeObj?.videoUrl || selectedEpisodeObj?.streamlink || content?.videoUrl || content?.streamlink) as string;

  useEffect(() => {
    if (content) {
      const genre = content.genre?.split(",")[0]?.trim();
      setRelatedContent(
        allContent
          .filter((m) => m.id !== id && m.genre?.includes(genre || ""))
          .slice(0, 8)
      );
    }
  }, [id]);

  useEffect(() => {
    if (!isSeries) return;
    if (!selectedEpisode && contentEpisodes.length > 0) {
      setSelectedEpisode(contentEpisodes[0].id);
    }
  }, [isSeries, selectedEpisode, contentEpisodes]);

  useEffect(() => {
    if (!artRef.current || !content) return;

    setPlayerError(null);

    // Proxy the URL if the host isn't CORS-friendly
    const rawUrl =
      activeVideoUrl ||
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    const videoUrl = getPlayableVideoUrl(rawUrl) || rawUrl;

    artInstance.current = new Artplayer({
      container: artRef.current,
      url: videoUrl,
      poster: content.poster || "",
      volume: 0.5,
      muted: false,
      autoplay: isLocked ? false : false, // We'll keep it false regardless but context is clear
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: true,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: "#a855f7",
      lang: navigator.language.toLowerCase() as any,
      lock: true,
      moreVideoAttr: {
        crossOrigin: "anonymous",
      },
      customType: {
        m3u8: function (video, url) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          }
        },
        mpd: function (video, url) {
          const player = dashjs.MediaPlayer().create();
          player.initialize(video, url, true);
        },
        // Handle custom dash extension if needed or generic application/dash+xml
        'application/dash+xml': function (video, url) {
          const player = dashjs.MediaPlayer().create();
          player.initialize(video, url, true);
        },
      },
      settings: [
        {
          html: "Speed",
          tooltip: "Normal",
          selector: [
            { html: "0.5x", value: 0.5 },
            { html: "0.75x", value: 0.75 },
            { default: true, html: "Normal", value: 1 },
            { html: "1.25x", value: 1.25 },
            { html: "1.5x", value: 1.5 },
            { html: "2x", value: 2 },
          ],
          onSelect(item: any) {
            if (artInstance.current) {
              artInstance.current.playbackRate = item.value;
            }
            return item.html;
          },
        },
      ],
    }, (art) => {
      // Ensure dashjs works with proxy URLs that might not have .mpd extension
      if (videoUrl.includes('manifest.mpd') || videoUrl.includes('video-proxy')) {
        const player = dashjs.MediaPlayer().create();
        player.initialize(art.video, videoUrl, true);
      }
    });

    // Hide reconnect notice
    artInstance.current.on("ready", () => {
      const reconnectEl = artRef.current?.querySelector(".art-reconnect");
      if (reconnectEl) (reconnectEl as HTMLElement).style.display = "none";
    });

    // Friendly error for CORS-blocked / unplayable sources
    artInstance.current.on("error", () => {
      setPlayerError(
        "This video host is blocking playback in the browser (CORS). Use a CORS-enabled direct MP4/HLS link, or host/proxy the video through your own storage."
      );
    });

    return () => {
      if (artInstance.current) {
        artInstance.current.destroy(false);
        artInstance.current = null;
      }
    };
  }, [content, isLocked, activeVideoUrl]);

  useEffect(() => {
    if (!isLocked && artInstance.current) {
      artInstance.current.play().catch(() => {});
    }
  }, [isLocked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 h-12 flex items-center px-4 bg-background/95 backdrop-blur-sm border-b border-border">
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <Skeleton className="aspect-video w-full rounded-xl lg:flex-1 lg:max-w-[65%]" />
            <Skeleton className="h-[50vh] w-full rounded-xl lg:w-[35%]" />
          </div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg mb-4">Content not found</p>
          <button onClick={() => navigate("/")} className="text-primary hover:underline">
            Go home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 h-12 flex items-center px-4 bg-background/95 backdrop-blur-sm border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-sm font-medium text-foreground ml-4 truncate">
          {content.title}
        </h1>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Player + Sidebar row - always show sidebar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Player area - smaller */}
          <div className="lg:flex-1 lg:max-w-[65%]">
            {isLocked ? (
              <div className="aspect-video relative group bg-card rounded-xl overflow-hidden">
                <div ref={artRef} className="absolute inset-0 opacity-40 blur-sm grayscale" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="text-center p-6 bg-background/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                    <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-foreground mb-2">
                      {needsAgent ? "Agent Access Required" : "Subscription Required"}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                      {needsAgent
                        ? "This content is available exclusively to Agent subscribers."
                        : "Subscribe to LUO FILM to watch this content."}
                    </p>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          setShowLoginModal(true);
                        } else {
                          setShowSubscriptionModal(true);
                        }
                      }}
                      className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-transform"
                    >
                      {!isAuthenticated ? "Login to Subscribe" : needsAgent ? "Get Agent Plan" : "Subscribe Now"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div ref={artRef} className="aspect-video w-full rounded-xl overflow-hidden" />

                {playerError && (
                  <p className="mt-2 text-sm text-muted-foreground">{playerError}</p>
                )}

                <PlayerActions title={content.title} url={activeVideoUrl} />
              </>
            )}
          </div>

          {/* Sidebar - Episodes for series OR Movie details for movies */}
          <div className="lg:w-[35%] bg-card rounded-xl p-4 max-h-[50vh] lg:max-h-[calc(65vw*9/16)] overflow-y-auto">
            {isSeries ? (
              <SeriesEpisodesPanel
                episodes={contentEpisodes}
                selectedEpisodeId={selectedEpisode}
                onSelectEpisode={(ep) => {
                  setSelectedEpisode(ep.id);
                  if (artInstance.current && (ep.videoUrl || ep.streamlink)) {
                    const nextUrl = ep.videoUrl || ep.streamlink;
                    artInstance.current.switchUrl(getPlayableVideoUrl(nextUrl as string) || (nextUrl as string));
                  }
                }}
              />
            ) : (
              <MovieDetailsPanel content={content} />
            )}
          </div>
        </div>

        {/* Related content - moved to grid under player */}
        {relatedContent.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-foreground mb-6">You May Also Like</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
              {relatedContent.map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
        defaultPlan={needsAgent ? "agent" : "normal"}
      />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowSubscriptionModal(true)}
      />
    </div>
  );
};

export default PlayPage;
