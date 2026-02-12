import { useEffect, useRef, useState } from "react";
import MovieBoxHeader from "@/components/MovieBoxHeader";
import MovieBoxSidebar from "@/components/MovieBoxSidebar";
import { useMovies } from "@/contexts/MovieContext";
import { useIsMobile } from "@/hooks/use-mobile";
import Artplayer from "artplayer";
import Hls from "hls.js";
import dashjs from "dashjs";
import { getPlayableVideoUrl } from "@/lib/videoProxy";

const TVChannels = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { tvChannels, loading } = useMovies();
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const artInstance = useRef<Artplayer | null>(null);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [isMobile]);

  useEffect(() => {
    if (tvChannels.length > 0 && !activeChannel) {
      setActiveChannel(tvChannels[0]);
    }
  }, [tvChannels, activeChannel]);

  useEffect(() => {
    if (!artRef.current || !activeChannel) return;

    const rawUrl = activeChannel.streamUrl;
    const videoUrl = getPlayableVideoUrl(rawUrl) || rawUrl;

    artInstance.current = new Artplayer({
      container: artRef.current,
      url: videoUrl,
      poster: activeChannel.image || "",
      volume: 0.5,
      isLive: true,
      autoplay: true,
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: true,
      setting: true,
      fullscreen: true,
      fullscreenWeb: true,
      theme: "#a855f7",
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
      },
    });

    return () => {
      if (artInstance.current) {
        artInstance.current.destroy(false);
        artInstance.current = null;
      }
    };
  }, [activeChannel]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MovieBoxHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <MovieBoxSidebar isOpen={sidebarOpen} />
      
      <main className={`pt-14 transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-48" : "ml-0"}`}>
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live TV Channels
          </h1>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Player Section */}
            <div className="lg:flex-1">
              <div className="aspect-video w-full bg-card rounded-2xl overflow-hidden border border-border shadow-2xl relative">
                <div ref={artRef} className="w-full h-full" />
                {!activeChannel && !loading && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    Select a channel to start watching
                  </div>
                )}
              </div>
              {activeChannel && (
                <div className="mt-4 p-4 bg-card rounded-xl border border-border">
                  <h2 className="text-xl font-bold">{activeChannel.title}</h2>
                  <p className="text-sm text-muted-foreground">Live Streaming</p>
                </div>
              )}
            </div>

            {/* Channels List */}
            <div className="lg:w-80 h-[50vh] lg:h-[calc(100vh-12rem)] overflow-y-auto bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold mb-4 text-muted-foreground uppercase text-xs tracking-wider">Available Channels</h3>
              <div className="space-y-3">
                {tvChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                      activeChannel?.id === channel.id
                        ? "bg-primary/10 border-primary/30 border ring-1 ring-primary/20"
                        : "hover:bg-secondary border border-transparent"
                    }`}
                  >
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-secondary shrink-0 border border-border">
                      <img src={channel.image} alt={channel.title} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-sm font-medium truncate ${activeChannel?.id === channel.id ? "text-primary" : "text-foreground"}`}>
                      {channel.title}
                    </span>
                  </button>
                ))}
                {tvChannels.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground text-center py-8">No channels available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TVChannels;
