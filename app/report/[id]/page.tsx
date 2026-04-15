import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import OverdueBadge from "@/components/OverdueBadge";
import ShareButton from "@/components/ShareButton";
import { getReport } from "@/lib/parliament";
import {
  isOverdue,
  isPending,
  daysOverdue,
  daysRemaining,
  daysToRespond,
  formatUKDate,
} from "@/lib/overdue";
import type { Metadata } from "next";

export const revalidate = 21600;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const report = await getReport(id);
    const overdue = isOverdue(report);
    const days = overdue ? daysOverdue(report) : null;

    return {
      title: overdue
        ? `${days} days overdue — ${report.title} — Parliament Tracker`
        : `${report.title} — Parliament Tracker`,
      description: `${report.committeeName} report published ${formatUKDate(report.reportPublishedDate)}.`,
      openGraph: {
        title: overdue
          ? `${report.committeeName}: ${days} days overdue`
          : report.committeeName,
        description: report.title,
      },
    };
  } catch {
    return { title: "Report — Parliament Tracker" };
  }
}

export default async function ReportPage({ params }: PageProps) {
  const { id } = await params;

  let report;
  try {
    report = await getReport(id);
  } catch {
    notFound();
  }

  const overdue = isOverdue(report);
  const pending = isPending(report);
  const responded = !!report.governmentResponseDate;

  const badgeStatus = overdue ? "overdue" : pending ? "pending" : "responded";
  const badgeDays = overdue
    ? daysOverdue(report)
    : pending
    ? -daysRemaining(report)
    : 0;

  const respondDays = daysToRespond(report);

  const siteUrl = "https://parliamenttracker.uk";
  const pageUrl = `${siteUrl}/report/${report.id}`;

  const tweetText = overdue
    ? `The government is ${daysOverdue(report)} days overdue responding to the ${report.committeeName} report on "${report.title}".\n\nTrack all overdue responses: ${siteUrl}`
    : `${report.committeeName} — "${report.title}"\n\n${siteUrl}`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(pageUrl)}`;

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
          <Link
            href={`/tracker/committee/${report.committeeId}`}
            className="hover:text-[#1A1A18] transition-colors"
          >
            {report.committeeName}
          </Link>
          <span>→</span>
          <span className="text-[#1A1A18] truncate max-w-xs">Report</span>
        </nav>

        {/* Screenshottable report card */}
        <div
          className={[
            "bg-white border border-[#E5E3DC] rounded-sm p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
            overdue ? "border-l-4 border-l-[#C41E3A]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <p className="text-[13px] text-[#6B6B67] mb-3">{report.committeeName}</p>

          <h1 className="text-[24px] font-semibold text-[#1A1A18] leading-snug max-w-2xl">
            {report.title}
          </h1>

          <p className="mt-3 text-[13px] text-[#6B6B67]">
            Published {formatUKDate(report.reportPublishedDate)}
          </p>

          <div className="mt-5 flex items-center gap-4">
            <OverdueBadge status={badgeStatus} days={badgeDays} />
            {overdue && (
              <p className="text-[15px] font-semibold text-[#C41E3A]">
                {daysOverdue(report)} days overdue as of today
              </p>
            )}
            {responded && respondDays !== null && (
              <p className="text-[15px] text-[#2D6A4F]">
                Responded after {respondDays} days
              </p>
            )}
          </div>

          {responded && report.governmentResponseDate && (
            <p className="mt-2 text-[13px] text-[#6B6B67]">
              Government response received{" "}
              {formatUKDate(report.governmentResponseDate)}
            </p>
          )}

          {/* Links */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={report.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#1A1A18] underline hover:text-[#C41E3A] transition-colors"
            >
              View full report on Parliament website ↗
            </a>
            {report.governmentResponseUrl && (
              <a
                href={report.governmentResponseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#1A1A18] underline hover:text-[#C41E3A] transition-colors"
              >
                View government response ↗
              </a>
            )}
          </div>
        </div>

        {/* Context strip */}
        <div className="mt-6 border border-[#E5E3DC] rounded-sm p-5 bg-white">
          <p className="text-[13px] text-[#6B6B67]">
            <span className="font-medium text-[#1A1A18]">
              {report.committeeName}
            </span>{" "}
            is a House of Commons select committee responsible for scrutinising{" "}
            {report.departmentName}.
          </p>
        </div>

        {/* Share section */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ShareButton
            url={pageUrl}
            text={tweetText}
            label="Share this report"
          />
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#E5E3DC] rounded-sm text-[13px] font-medium text-[#1A1A18] bg-white hover:border-[#1A1A18] transition-colors"
          >
            Post to X / Twitter ↗
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
