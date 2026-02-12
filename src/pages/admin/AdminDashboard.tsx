import { useMovies } from "@/contexts/MovieContext";
import { useAuth } from "@/contexts/AuthContext";
import { Film, Tv, Users, CreditCard, TrendingUp, MonitorPlay, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { movies, series, episodes, heroSlides, tvChannels } = useMovies();
  const { allUsers, allSubscriptions } = useAuth();
  const [welcomeImage, setWelcomeImage] = useState(localStorage.getItem("welcome_image") || "");
  const [ctaText, setCtaText] = useState(localStorage.getItem("welcome_cta_text") || "Get Started");
  const [ctaLink, setCtaLink] = useState(localStorage.getItem("welcome_cta_link") || "/movies");

  const handleSaveWelcome = () => {
    localStorage.setItem("welcome_image", welcomeImage);
    localStorage.setItem("welcome_cta_text", ctaText);
    localStorage.setItem("welcome_cta_link", ctaLink);
    toast.success("Welcome settings saved!");
  };

  const stats = [
    { label: "Total Movies", value: movies.length, icon: Film, color: "text-primary" },
    { label: "Total Series", value: series.length, icon: Tv, color: "text-accent" },
    { label: "TV Channels", value: tvChannels.length, icon: MonitorPlay, color: "text-primary" },
    { label: "Total Users", value: allUsers.length, icon: Users, color: "text-primary" },
    { label: "Active Subs", value: allSubscriptions.filter((s) => s.status === "active").length, icon: CreditCard, color: "text-accent" },
    { label: "Episodes", value: episodes.length, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-foreground">Welcome Popup Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Welcome Image URL</Label>
              <Input 
                value={welcomeImage} 
                onChange={(e) => setWelcomeImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input 
                  value={ctaText} 
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Subscribe Now"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input 
                  value={ctaLink} 
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="e.g. /movies"
                />
              </div>
            </div>
            <Button onClick={handleSaveWelcome} className="w-full mt-2">
              Save Welcome Settings
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Recent Users</h3>
          <div className="space-y-2">
            {allUsers.slice(-5).reverse().map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${u.role === "admin" ? "gradient-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Recent Subscriptions</h3>
          <div className="space-y-2">
            {allSubscriptions.slice(-5).reverse().map((s) => {
              const user = allUsers.find((u) => u.id === s.userId);
              return (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{s.plan} - {s.duration}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${s.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive"}`}>
                    {s.status}
                  </span>
                </div>
              );
            })}
            {allSubscriptions.length === 0 && (
              <p className="text-sm text-muted-foreground">No subscriptions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
