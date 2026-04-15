import type { BadgeStatus } from "@/lib/types";

interface OverdueBadgeProps {
  status: BadgeStatus;
  days: number; // positive = overdue, negative = days remaining
}

export default function OverdueBadge({ status, days }: OverdueBadgeProps) {
  if (status === "overdue") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FDF0F2] text-[#C41E3A]">
        {days} {days === 1 ? "day" : "days"} overdue
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FEF3C7] text-[#B45309]">
        due in {Math.abs(days)} {Math.abs(days) === 1 ? "day" : "days"}
      </span>
    );
  }

  // responded
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EDF7F2] text-[#2D6A4F]">
      responded
    </span>
  );
}
