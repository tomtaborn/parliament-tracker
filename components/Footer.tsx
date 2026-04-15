export default function Footer() {
  return (
    <footer className="border-t border-[#E5E3DC] bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-[13px] text-[#6B6B67] space-y-1">
            <p>
              Data sourced from the{" "}
              <a
                href="https://developer.parliament.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#1A1A18] transition-colors"
              >
                UK Parliament API
              </a>
              . House of Commons only.
            </p>
            <p>Not affiliated with or endorsed by Parliament.</p>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-[#6B6B67]">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1A1A18] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
