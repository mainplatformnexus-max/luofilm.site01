import { Download, Share2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import SubscriptionModal from "@/components/SubscriptionModal";
import LoginModal from "@/components/LoginModal";

type PlayerActionsProps = {
  title: string;
  url?: string;
};

export default function PlayerActions({ title, url }: PlayerActionsProps) {
  const { hasNormalAccess, isAuthenticated, trackActivity } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const canDownload = Boolean(url);

  const handleDownload = (e: React.MouseEvent) => {
    if (!url) return;
    e.preventDefault();

    if (!hasNormalAccess) {
      if (!isAuthenticated) {
        setShowLoginModal(true);
      } else {
        setShowSubscriptionModal(true);
      }
      return;
    }
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    
    // Add ?download=true to the URL
    const downloadUrl = url.includes('?') ? `${url}&download=true` : `${url}?download=true`;
    
    link.href = downloadUrl;
    link.download = `${title}.mp4`;
    
    // Set target to _blank to ensure it doesn't navigate away in some browsers
    // though the download attribute should handle it
    link.target = '_blank';
    
    trackActivity("download", title, title);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 pt-3 border-t border-border">
        {canDownload && (
          <button
            onClick={handleDownload}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-opacity ${
              hasNormalAccess 
                ? "bg-primary text-primary-foreground hover:opacity-90" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {hasNormalAccess ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4 text-primary" />}
            Download {!hasNormalAccess && "(Locked)"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            const shareUrl = window.location.href;
            if (navigator.share) {
              navigator.share({ title, url: shareUrl });
            } else {
              navigator.clipboard.writeText(shareUrl);
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
        defaultPlan="normal"
      />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowSubscriptionModal(true)}
      />
    </div>
  );
}
