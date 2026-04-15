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

  // Link to the first committee in the dept for now
  const primaryCommitteeId = committees[0]?.id;
  const isOverdue = overdueCount > 0;

  return (
    <Link
      href={primaryCommitteeId ? `/tracker/committee/${primaryCommitteeId}` : "/tracker"}
      className="block"
    >
      <div
        className={[
          "bg-white border border-[#E5E3DC] rounded-sm p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
          "hover:border-[#C41E3A] transition-colors duration-150",
          isOverdue ? "border-l-4 border-l-[#C41E3A]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Department name */}
        <h3 className="text-[15px] font-semibold text-[#1A1A18] leading-snug">
          {departmentName}
        </h3>

        {/* Committee count */}
        <p className="text-[11px] text-[#6B6B67] mt-0.5">
          {committees.length} {committees.length === 1 ? "committee" : "committees"}
        </p>

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
            <span className="text-[#C41E3A] font-500">
              {longestOverdueDays} days
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
