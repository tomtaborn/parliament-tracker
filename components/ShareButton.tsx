"use client";

interface ShareButtonProps {
  url: string;
  text: string;
  label?: string;
}

export default function ShareButton({
  url,
  text,
  label = "Share",
}: ShareButtonProps) {
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url, text });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }
    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard.");
    } catch {
      // Clipboard not available — do nothing
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#E5E3DC] rounded-sm text-[13px] font-medium text-[#1A1A18] bg-white hover:border-[#1A1A18] transition-colors"
    >
      {label}
    </button>
  );
}
