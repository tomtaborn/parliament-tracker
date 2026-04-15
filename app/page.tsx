import { Suspense } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getOverallStats } from "@/lib/parliament";

export const revalidate = 21600; // 6 hours

async function LiveStats() {
  try {
    const stats = await getOverallStats();
    return (
      <div className="bg-[#1A1A18] text-white py-10 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-[48px] leading-none font-semibold text-[#C41E3A]">
              {stats.totalOverdue}
            </p>
            <p className="mt-2 text-[13px] text-[#A0A09C]">
              responses currently overdue
            </p>
          </div>
          <div>
            <p className="text-[48px] leading-none font-semibold text-white">
              {stats.longestOutstandingDays}
            </p>
            <p className="mt-2 text-[13px] text-[#A0A09C]">
              days — longest single outstanding response
            </p>
          </div>
          <div>
            <p
              className="text-[32px] leading-none font-semibold text-white truncate"
              title={stats.mostOverdueDepartment}
            >
              {stats.mostOverdueDepartment.replace(/^The /, "")}
            </p>
            <p className="mt-2 text-[13px] text-[#A0A09C]">
              department with the most overdue responses
            </p>
          </div>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="bg-[#1A1A18] text-white py-10 px-6">
        <p className="text-[13px] text-[#A0A09C] max-w-5xl mx-auto">
          Live figures temporarily unavailable.
        </p>
      </div>
    );
  }
}

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav />

      {/* Hero */}
      <section className="bg-[#FAFAF8] border-b border-[#E5E3DC] py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-[40px] sm:text-[48px] leading-[1.05] font-semibold text-[#1A1A18] max-w-2xl">
            Parliament&apos;s ignored homework.
          </h1>
          <p className="mt-5 text-[18px] leading-[1.6] text-[#6B6B67] max-w-xl">
            Select committees do some of the most important work in British
            politics. The government is supposed to respond within 60 days.
            Often, it doesn&apos;t.
          </p>
          <div className="mt-8">
            <Link
              href="/tracker"
              className="inline-flex items-center gap-2 bg-[#C41E3A] text-white px-6 py-3 text-[15px] font-medium rounded-sm hover:bg-[#a81930] transition-colors"
            >
              See who&apos;s overdue →
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-[#6B6B67]">
            House of Commons only. Data updated every 6 hours.
          </p>
        </div>
      </section>

      {/* Live stats strip — streams in independently */}
      <Suspense
        fallback={
          <div className="bg-[#1A1A18] py-10 px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="h-12 w-24 bg-[#333330] rounded mb-2" />
                  <div className="h-3 w-40 bg-[#333330] rounded" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <LiveStats />
      </Suspense>

      {/* Explainer */}
      <section className="bg-[#FAFAF8] py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1A1A18] mb-3">
              What are select committees?
            </h2>
            <p className="text-[15px] leading-[1.6] text-[#6B6B67]">
              Select committees are cross-party groups of MPs that scrutinise
              the work of government departments. They hold inquiries, take
              evidence from experts and ministers, and publish reports with
              recommendations. They are one of Parliament&apos;s most powerful
              accountability mechanisms.
            </p>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1A1A18] mb-3">
              What is the 60-day rule?
            </h2>
            <p className="text-[15px] leading-[1.6] text-[#6B6B67]">
              By parliamentary convention, the government is obliged to respond
              formally to each select committee report within 60 days of
              publication. This is not a law — but it is a constitutional
              expectation that successive governments have repeatedly
              committed to upholding.
            </p>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1A1A18] mb-3">
              Why does it matter?
            </h2>
            <p className="text-[15px] leading-[1.6] text-[#6B6B67]">
              When the government ignores committee reports, it is not merely
              being discourteous. It is frustrating Parliament&apos;s ability to hold
              the executive to account. This tracker makes visible what has
              previously required a Freedom of Information request to uncover.
            </p>
          </div>
        </div>
      </section>

      {/* Coming soon strip */}
      <section className="bg-white border-t border-b border-[#E5E3DC] py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B6B67] mb-4">
            Coming soon
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-[#E5E3DC] rounded-sm p-4">
              <p className="text-[15px] font-medium text-[#1A1A18]">
                Consistency checker
              </p>
              <p className="mt-1 text-[13px] text-[#6B6B67]">
                Compare what ministers say in written answers against what they
                told committees.
              </p>
            </div>
            <div className="border border-[#E5E3DC] rounded-sm p-4">
              <p className="text-[15px] font-medium text-[#1A1A18]">
                Speech reader
              </p>
              <p className="mt-1 text-[13px] text-[#6B6B67]">
                Track individual MP voting records and speech patterns across
                parliamentary sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
