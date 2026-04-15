import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-[#E5E3DC] bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-[#C41E3A] font-semibold text-sm tracking-widest uppercase">
            Parliament
          </span>
          <span className="text-[#1A1A18] font-semibold text-sm tracking-widest uppercase">
            Tracker
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/tracker"
            className="text-[13px] font-500 text-[#1A1A18] hover:text-[#C41E3A] transition-colors"
          >
            Tracker →
          </Link>
        </nav>
      </div>
    </header>
  );
}
