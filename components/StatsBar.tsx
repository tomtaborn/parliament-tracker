import type { OverallStats } from "@/lib/types";

interface StatsBarProps {
  stats: OverallStats;
}

function StatCard({
  value,
  label,
  accent,
  delay,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
  delay?: string;
}) {
  return (
    <div className="flex-1 bg-white border border-[#E5E3DC] rounded-sm p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <p
        className="stat-number text-[32px] leading-none font-semibold"
        style={{
          color: accent ? "#C41E3A" : "#1A1A18",
          animationDelay: delay ?? "0s",
        }}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[13px] text-[#6B6B67]">{label}</p>
    </div>
  );
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <StatCard
        value={stats.totalOverdue}
        label="responses overdue"
        accent
        delay="0s"
      />
      <StatCard
        value={stats.totalPending}
        label="responses outstanding (within deadline)"
        delay="0.1s"
      />
      <StatCard
        value={stats.respondedLast30Days}
        label="received in the last 30 days"
        delay="0.2s"
      />
    </div>
  );
}
