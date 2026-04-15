import Link from "next/link";
import type { CommitteeSummary } from "@/lib/types";
import { daysOverdue } from "@/lib/overdue";

interface CommitteeListProps {
  committees: CommitteeSummary[];
}

export default function CommitteeList({ committees }: CommitteeListProps) {
  if (committees.length === 0) {
    return (
      <p className="text-[13px] text-[#6B6B67]">No committees to display.</p>
    );
  }

  return (
    <div className="divide-y divide-[#E5E3DC]">
      {committees.map((committee) => {
        const longestDays =
          committee.overdueReports.length > 0
            ? Math.max(...committee.overdueReports.map(daysOverdue))
            : null;

        return (
          <Link
            key={committee.id}
            href={`/tracker/committee/${committee.id}`}
            className="flex items-center justify-between py-4 gap-4 hover:bg-[#FAFAF8] px-2 -mx-2 rounded-sm transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-[#1A1A18] group-hover:text-[#C41E3A] transition-colors truncate">
                {committee.name}
              </p>
              {longestDays !== null && (
                <p className="text-[13px] text-[#6B6B67] mt-0.5">
                  Longest outstanding: {longestDays} days
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {committee.overdueReports.length > 0 && (
                <span className="text-[13px] font-medium text-[#C41E3A]">
                  {committee.overdueReports.length} overdue
                </span>
              )}
              {committee.pendingReports.length > 0 && (
                <span className="text-[13px] text-[#B45309]">
                  {committee.pendingReports.length} pending
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
