import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ReportCard from "@/components/ReportCard";
import ShareButton from "@/components/ShareButton";
import { getCommitteeSummary } from "@/lib/parliament";
import type { Metadata } from "next";

export const revalidate = 21600;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const committee = await getCommitteeSummary(id);
    return {
      title: `${committee.name} — Parliament Tracker`,
      description: `${committee.overdueReports.length} overdue, ${committee.pendingReports.length} within deadline, ${committee.respondedReports.length} responded.`,
    };
  } catch {
    return { title: "Committee — Parliament Tracker" };
  }
}

export default async function CommitteePage({ params }: PageProps) {
  const { id } = await params;

  let committee;
  try {
    committee = await getCommitteeSummary(id);
  } catch {
    notFound();
  }

  const allReports = [
    ...committee.overdueReports,
    ...committee.pendingReports,
    ...committee.respondedReports,
  ];

  const pageUrl = `https://parliamenttracker.uk/tracker/committee/${id}`;
  const shareText = `${committee.name}: ${committee.overdueReports.length} overdue parliamentary response${committee.overdueReports.length !== 1 ? "s" : ""}.`;

  return (
    <div className="flex flex-col flex-1">
      <Nav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-[#6B6B67] mb-6">
          <Link href="/tracker" className="hover:text-[#1A1A18] transition-colors">
            Tracker
          </Link>
          <span>→</span>
          <span className="text-[#1A1A18]">{committee.name}</span>
        </nav>

        {/* Committee header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold text-[#1A1A18] leading-tight">
            {committee.name}
          </h1>
          <p className="mt-1 text-[15px] text-[#6B6B67]">
            {committee.departmentName}
            {committee.chairName ? ` · Chair: ${committee.chairName}` : ""}
          </p>

          {/* Summary counts */}
          <div className="mt-4 flex flex-wrap gap-4 text-[13px]">
            {committee.overdueReports.length > 0 && (
              <span className="text-[#C41E3A] font-medium">
                {committee.overdueReports.length} overdue
              </span>
            )}
            {committee.pendingReports.length > 0 && (
              <span className="text-[#B45309]">
                {committee.pendingReports.length} within deadline
              </span>
            )}
            {committee.respondedReports.length > 0 && (
              <span className="text-[#2D6A4F]">
                {committee.respondedReports.length} responded
              </span>
            )}
            {allReports.length === 0 && (
              <span className="text-[#6B6B67]">No reports found</span>
            )}
          </div>

          <div className="mt-4">
            <ShareButton
              url={pageUrl}
              text={shareText}
              label="Share this committee's record"
            />
          </div>
        </div>

        {/* Report list */}
        {allReports.length === 0 ? (
          <p className="text-[13px] text-[#6B6B67]">No reports found for this committee.</p>
        ) : (
          <div className="space-y-3">
            {[
              ...committee.overdueReports,
              ...committee.pendingReports,
              ...committee.respondedReports,
            ].map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
