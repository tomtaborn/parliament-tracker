import Link from "next/link";
import type { CommitteeReport } from "@/lib/types";
import OverdueBadge from "./OverdueBadge";
import {
  isOverdue,
  isPending,
  daysOverdue,
  daysRemaining,
  daysToRespond,
  formatUKDate,
} from "@/lib/overdue";

interface ReportCardProps {
  report: CommitteeReport;
}

export default function ReportCard({ report }: ReportCardProps) {
  const overdue = isOverdue(report);
  const pending = isPending(report);
  const responded = !!report.governmentResponseDate;

  const badgeStatus = overdue ? "overdue" : pending ? "pending" : "responded";
  const badgeDays = overdue
    ? daysOverdue(report)
    : pending
    ? -daysRemaining(report)
    : 0;

  const respondDays = responded ? daysToRespond(report) : null;

  return (
    <div
      className={[
        "bg-white border border-[#E5E3DC] rounded-sm p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
        overdue ? "border-l-4 border-l-[#C41E3A]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <a
            href={report.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-500 text-[#1A1A18] hover:text-[#C41E3A] transition-colors leading-snug block"
          >
            {report.title}
          </a>
          <p className="mt-1 text-[13px] text-[#6B6B67]">
            Published {formatUKDate(report.reportPublishedDate)}
          </p>
        </div>
        <div className="shrink-0 mt-0.5">
          <OverdueBadge status={badgeStatus} days={badgeDays} />
        </div>
      </div>

      {/* Extra context */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#6B6B67]">
        {overdue && (
          <span className="text-[#C41E3A]">
            {daysOverdue(report)} days overdue as of today
          </span>
        )}
        {responded && respondDays !== null && (
          <span className="text-[#2D6A4F]">
            Responded after {respondDays} days
            {report.governmentResponseDate
              ? ` (${formatUKDate(report.governmentResponseDate)})`
              : ""}
          </span>
        )}
        {report.governmentResponseUrl && (
          <a
            href={report.governmentResponseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#1A1A18] transition-colors"
          >
            View response
          </a>
        )}
        <Link
          href={`/report/${report.id}`}
          className="underline hover:text-[#1A1A18] transition-colors"
        >
          Share this report
        </Link>
      </div>
    </div>
  );
}
