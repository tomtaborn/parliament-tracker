import Link from "next/link";
import type { DepartmentSummary } from "@/lib/types";

interface DepartmentCardProps {
  summary: DepartmentSummary;
}

export default function DepartmentCard({ summary }: DepartmentCardProps) {
  const {
    departmentName,
    committees,
    overdueCount,
    pendingCount,
    respondedCount,
    longestOverdueDays,
  } = summary;

  const isOverdue = overdueCount > 0;
  const singleCommittee = committees.length === 1 ? committees[0] : null;

  const cardInner = (
    <div
      className={[
        "bg-white border border-[#E5E3DC] rounded-sm p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] h-full",
        "transition-colors duration-150",
        isOverdue ? "border-l-4 border-l-[#C41E3A]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Department name */}
      <h3 className="text-[15px] font-semibold text-[#1A1A18] leading-snug">
        {departmentName}
      </h3>

      {/* Committee count / names */}
      {committees.length === 1 ? (
        <p className="text-[11px] text-[#6B6B67] mt-0.5 truncate">
          {committees[0].name}
        </p>
      ) : (
        <p className="text-[11px] text-[#6B6B67] mt-0.5">
          {committees.length} committees
        </p>
      )}

      {/* Counts */}
      <div className="mt-4 flex items-end gap-5">
        <div>
          <p
            className="text-[32px] leading-none font-semibold"
            style={{ color: isOverdue ? "#C41E3A" : "#6B6B67" }}
          >
            {overdueCount}
          </p>
          <p className="text-[11px] text-[#6B6B67] mt-1">overdue</p>
        </div>
        {pendingCount > 0 && (
          <div>
            <p className="text-[24px] leading-none font-semibold text-[#B45309]">
              {pendingCount}
            </p>
            <p className="text-[11px] text-[#6B6B67] mt-1">within deadline</p>
          </div>
        )}
        {respondedCount > 0 && (
          <div>
            <p className="text-[24px] leading-none font-semibold text-[#2D6A4F]">
              {respondedCount}
            </p>
            <p className="text-[11px] text-[#6B6B67] mt-1">responded</p>
          </div>
        )}
      </div>

      {/* Longest outstanding */}
      {longestOverdueDays !== null && longestOverdueDays > 0 && (
        <p className="mt-3 text-[13px] text-[#6B6B67]">
          Longest outstanding:{" "}
          <span className="text-[#C41E3A] font-medium">
            {longestOverdueDays} days
          </span>
        </p>
      )}

      {/* Multi-committee links */}
      {committees.length > 1 && (
        <div className="mt-4 pt-3 border-t border-[#E5E3DC] flex flex-col gap-1">
          {committees.map((c) => (
            <Link
              key={c.id}
              href={`/tracker/committee/${c.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[12px] text-[#6B6B67] hover:text-[#C41E3A] transition-colors truncate"
            >
              {c.name} →
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  // Single committee: whole card is a link
  if (singleCommittee) {
    return (
      <Link
        href={`/tracker/committee/${singleCommittee.id}`}
        className="block group hover:[&_div:first-child]:border-[#C41E3A]"
      >
        {cardInner}
      </Link>
    );
  }

  // Multiple committees: card is not itself a link (individual committee links are inside)
  return <div>{cardInner}</div>;
}
