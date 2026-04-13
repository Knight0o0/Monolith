import { Link2, Share2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// 自定义 SVG Icons 因为 Lucide移除了品牌图标
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

interface ShareButtonsProps {
  title: string;
  url?: string;
  className?: string;
}

export function ShareButtons({ title, url, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    }).catch(console.error);
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        url: shareUrl,
      }).catch(console.error);
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className={`flex items-center gap-[12px] ${className}`}>
      <span className="text-[12px] font-medium text-muted-foreground/50 uppercase tracking-widest hidden sm:inline-block">Share</span>
      <div className="flex items-center gap-[8px]">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-card/60 border border-border/30 text-muted-foreground transition-all hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white"
          title="分享到 X"
          aria-label="分享到 X"
        >
          <TwitterIcon className="h-[14px] w-[14px]" />
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-card/60 border border-border/30 text-muted-foreground transition-all hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5]"
          title="分享到 LinkedIn"
          aria-label="分享到 LinkedIn"
        >
          <LinkedinIcon className="h-[14px] w-[14px]" />
        </a>
        <button
          onClick={handleCopy}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-card/60 border border-border/30 text-muted-foreground transition-all hover:bg-card hover:text-foreground hover:border-border/60"
          title={copied ? "已复制链接!" : "复制链接"}
          aria-label={copied ? "已复制链接!" : "复制链接"}
        >
          <Link2 className={`h-[14px] w-[14px] transition-transform ${copied ? "scale-110 text-green-500" : ""}`} />
        </button>
        {hasNativeShare && (
          <button
            onClick={handleNativeShare}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-card/60 border border-border/30 text-muted-foreground transition-all hover:bg-card hover:text-foreground hover:border-border/60 sm:hidden"
            title="系统分享"
            aria-label="系统分享"
          >
            <Share2 className="h-[14px] w-[14px]" />
          </button>
        )}
      </div>
    </div>
  );
}
