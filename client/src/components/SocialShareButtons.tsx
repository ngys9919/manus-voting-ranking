import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getShareUrl,
  openShareWindow,
  copyToClipboard,
  shareViaWebAPI,
  type ShareOptions,
} from "@/lib/socialSharing";
import { Share2, Twitter, Facebook, Linkedin, Copy, Share } from "lucide-react";

interface SocialShareButtonsProps {
  shareOptions: ShareOptions;
  variant?: "default" | "compact" | "inline";
  showLabel?: boolean;
}

export function SocialShareButtons({
  shareOptions,
  variant = "default",
  showLabel = true,
}: SocialShareButtonsProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async (platform: "twitter" | "facebook" | "linkedin") => {
    const shareUrl = getShareUrl(platform, shareOptions);
    openShareWindow(shareUrl, platform);
    toast.success(`Opening ${platform} share dialog...`);
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareOptions.text);
    if (success) {
      setIsCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleNativeShare = async () => {
    const success = await shareViaWebAPI(shareOptions);
    if (!success) {
      // Fallback to copy if Web Share API is not available
      await handleCopyLink();
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleShare("twitter")}
          title="Share on Twitter"
          className="p-2"
        >
          <Twitter className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleShare("facebook")}
          title="Share on Facebook"
          className="p-2"
        >
          <Facebook className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleShare("linkedin")}
          title="Share on LinkedIn"
          className="p-2"
        >
          <Linkedin className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyLink}
          title="Copy to clipboard"
          className="p-2"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleShare("twitter")}
          className="text-blue-400 hover:text-blue-600"
        >
          <Twitter className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleShare("facebook")}
          className="text-blue-600 hover:text-blue-800"
        >
          <Facebook className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleShare("linkedin")}
          className="text-blue-700 hover:text-blue-900"
        >
          <Linkedin className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Share Achievement</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button
          onClick={() => handleShare("twitter")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Twitter className="w-4 h-4" />
          {showLabel && <span>Twitter</span>}
        </Button>

        <Button
          onClick={() => handleShare("facebook")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Facebook className="w-4 h-4" />
          {showLabel && <span>Facebook</span>}
        </Button>

        <Button
          onClick={() => handleShare("linkedin")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Linkedin className="w-4 h-4" />
          {showLabel && <span>LinkedIn</span>}
        </Button>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Copy className={`w-4 h-4 ${isCopied ? "text-green-600" : ""}`} />
          {showLabel && <span>{isCopied ? "Copied!" : "Copy"}</span>}
        </Button>
      </div>

      {/* Native share button if available */}
      {typeof navigator !== "undefined" && navigator.share && (
        <Button
          onClick={handleNativeShare}
          className="w-full flex items-center gap-2"
        >
          <Share className="w-4 h-4" />
          Share via...
        </Button>
      )}

      <p className="text-xs text-gray-500 text-center">
        Share your achievement with friends and challenge them to beat your score!
      </p>
    </div>
  );
}
