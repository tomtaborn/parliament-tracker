import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StatsBar from "@/components/StatsBar";
import TrackerFilters from "@/components/TrackerFilters";
import { getAllDepartmentSummaries, getOverallStats } from "@/lib/parliament";

export const revalidate = 21600; // 6 hours

export const metadata = {
  title: "Select Committee Response Tracker — Parliament Tracker",
  description:
    "Government departments ranked by overdue parliamentary committee responses. Updated every 6 hours.",
};

function formatTimestamp() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function TrackerPage() {
  let summaries;
  let stats;
  let error = false;

  try {
    [summaries, stats] = await Promise.all([
      getAllDepartmentSummaries(),
      getOverallStats(),
    ]);
  } catch {
    error = true;
    summaries = [];
    stats = {
      totalOverdue: 0,
      totalPending: 0,
      respondedLast30Days: 0,
      mostOverdueDepartment: "—",
      longestOutstandingDays: 0,
    };
  }

  return (
    <div className="flex flex-col flex-1">
      <Nav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold text-[#1A1A18] leading-tight">
            Select Committee Response Tracker
          </h1>
          <p className="mt-2 text-[15px] text-[#6B6B67] max-w-xl">
            Government departments ranked by overdue parliamentary responses.
            Updated every 6 hours.
          </p>
          <p className="mt-1 text-[11px] text-[#6B6B67]">
            Last updated: {formatTimestamp()}
          </p>
        </div>

        {error ? (
          <div className="border border-[#E5E3DC] rounded-sm p-6 text-[15px] text-[#6B6B67]">
            Data temporarily unavailable. Please try again shortly.
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="mb-8">
              <StatsBar stats={stats} />
            </div>

            {/* Filtered department grid */}
            <TrackerFilters summaries={summaries} />
          </>
        )}

        {/* Methodology note */}
        <div className="mt-12 pt-6 border-t border-[#E5E3DC]">
          <p className="text-[13px] text-[#6B6B67] max-w-2xl leading-relaxed">
            <strong className="font-500 text-[#1A1A18]">Methodology:</strong>{" "}
            Responses are considered overdue after 60 calendar days from report
            publication date, in line with parliamentary convention.
            Parliament&apos;s 60-day convention is sometimes interpreted as working
            days — figures may differ slightly from official parliamentary
            records. Data sourced from the{" "}
            <a
              href="https://developer.parliament.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#1A1A18]"
            >
              UK Parliament API
            </a>
            . House of Commons only. Always verify with source data before
            citing formally.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
