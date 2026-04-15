"use client";

import { useState } from "react";
import type { DepartmentSummary } from "@/lib/types";
import DepartmentCard from "./DepartmentCard";

type Filter = "all" | "overdue" | "responded";

interface TrackerFiltersProps {
  summaries: DepartmentSummary[];
}

export default function TrackerFilters({ summaries }: TrackerFiltersProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = summaries.filter((d) => {
    if (filter === "overdue") return d.overdueCount > 0;
    if (filter === "responded") return d.respondedCount > 0;
    return true;
  });

  const pills: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Overdue only", value: "overdue" },
    { label: "Responded", value: "responded" },
  ];

  return (
    <div>
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {pills.map((p) => (
          <button
            key={p.value}
            onClick={() => setFilter(p.value)}
            className={[
              "px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-colors",
              filter === p.value
                ? "bg-[#1A1A18] text-white border-[#1A1A18]"
                : "bg-white text-[#1A1A18] border-[#E5E3DC] hover:border-[#1A1A18]",
            ].join(" ")}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-auto text-[13px] text-[#6B6B67]">
          {filtered.length} department{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {filtered.map((summary) => (
          <DepartmentCard key={summary.departmentName} summary={summary} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-[13px] text-[#6B6B67] py-8">
            No departments match this filter.
          </p>
        )}
      </div>
    </div>
  );
}
