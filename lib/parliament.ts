import type {
  ApiCollection,
  ApiCommitteeDetails,
  ApiCommitteeSummary,
  ApiPublication,
  CommitteeReport,
  CommitteeSummary,
  DepartmentSummary,
  OverallStats,
} from "./types";
import {
  isOverdue,
  isPending,
  respondedWithinDays,
  daysOverdue,
} from "./overdue";

const BASE = "https://committees-api.parliament.uk";
const REVALIDATE = 21600; // 6 hours
const FETCH_TIMEOUT_MS = 10_000; // abort any single call after 10s

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Parliament API ${res.status} — ${url.pathname}`);
    }
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Normalisers ──────────────────────────────────────────────────────────────

function normalisePublication(
  pub: ApiPublication,
  fallbackCommittee?: ApiCommitteeSummary
): CommitteeReport {
  const committee = pub.committee ?? fallbackCommittee ?? null;
  const govResp = pub.governmentResponses;
  const responsePub = govResp?.publication?.[0] ?? null;

  return {
    id: pub.id,
    title: pub.description?.trim() || "Untitled Report",
    reportPublishedDate: pub.publicationStartDate ?? new Date().toISOString(),
    governmentResponseDate: responsePub?.publicationStartDate ?? null,
    committeeId: committee?.id ?? 0,
    committeeName: committee?.name?.trim() ?? "Unknown Committee",
    departmentName:
      committee?.scrutinisingDepartments?.find((d) => d.name?.trim())?.name?.trim() ??
      "Unknown Department",
    reportUrl:
      pub.additionalContentUrl ??
      `https://committees.parliament.uk/publications/${pub.id}/`,
    governmentResponseUrl: responsePub?.additionalContentUrl ?? null,
  };
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchAllCommittees(): Promise<ApiCommitteeSummary[]> {
  // Fetch all committees in a single large call — 200 is more than enough
  const data = await apiFetch<ApiCollection<ApiCommitteeSummary>>(
    "/api/Committees",
    { House: "Commons", Take: "200", Skip: "0", ShowOnWebsiteOnly: "false" }
  );
  return data.items ?? [];
}

async function fetchReportsForCommittee(
  committeeId: number,
  committee: ApiCommitteeSummary
): Promise<CommitteeReport[]> {
  try {
    const data = await apiFetch<ApiCollection<ApiPublication>>(
      "/api/Publications",
      {
        CommitteeId: String(committeeId),
        Take: "100",
        Skip: "0",
        ShowOnWebsiteOnly: "false",
      }
    );
    const pubs = data.items ?? [];
    return pubs
      .filter(
        (p) =>
          p.governmentResponses?.responseExcepted === true &&
          p.publicationStartDate !== null
      )
      .map((p) => normalisePublication(p, committee));
  } catch {
    // Timeout or API error for this committee — skip it gracefully
    return [];
  }
}

// Run promises in batches of `size` to avoid hammering the API
async function batchSettled<T>(
  tasks: (() => Promise<T>)[],
  size: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += size) {
    const batch = tasks.slice(i, i + size);
    const settled = await Promise.allSettled(batch.map((fn) => fn()));
    for (const r of settled) {
      if (r.status === "fulfilled") results.push(r.value);
    }
  }
  return results;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAllDepartmentSummaries(): Promise<DepartmentSummary[]> {
  const allCommittees = await fetchAllCommittees();

  // Only fetch publications for committees that have a named scrutinising department
  const selectCommittees = allCommittees.filter((c) =>
    c.scrutinisingDepartments?.some((d) => d.name?.trim())
  );

  // Fetch in batches of 5 to avoid overwhelming the API
  const allReports = await batchSettled(
    selectCommittees.map((c) => () => fetchReportsForCommittee(c.id, c)),
    5
  );

  // Group by department → committee
  const deptMap = new Map<string, CommitteeSummary[]>();

  selectCommittees.forEach((committee, i) => {
    const reports = allReports[i] ?? [];
    if (reports.length === 0) return;

    const deptName =
      committee.scrutinisingDepartments?.find((d) => d.name?.trim())?.name?.trim() ??
      "Unknown Department";

    const overdue = reports
      .filter(isOverdue)
      .sort((a, b) => daysOverdue(b) - daysOverdue(a));
    const pending = reports.filter(isPending);
    const responded = reports.filter((r) => !!r.governmentResponseDate);

    const summary: CommitteeSummary = {
      id: committee.id,
      name: committee.name?.trim() ?? "Unknown Committee",
      departmentName: deptName,
      chairName: null,
      overdueReports: overdue,
      pendingReports: pending,
      respondedReports: responded,
    };

    if (!deptMap.has(deptName)) deptMap.set(deptName, []);
    deptMap.get(deptName)!.push(summary);
  });

  const summaries: DepartmentSummary[] = [];
  for (const [deptName, committees] of deptMap) {
    const overdueCount = committees.reduce(
      (n, c) => n + c.overdueReports.length,
      0
    );
    const pendingCount = committees.reduce(
      (n, c) => n + c.pendingReports.length,
      0
    );
    const respondedCount = committees.reduce(
      (n, c) => n + c.respondedReports.length,
      0
    );
    const longestOverdueDays =
      overdueCount > 0
        ? Math.max(
            ...committees.flatMap((c) => c.overdueReports.map(daysOverdue))
          )
        : null;

    summaries.push({
      departmentName: deptName,
      committees,
      overdueCount,
      pendingCount,
      respondedCount,
      longestOverdueDays,
    });
  }

  return summaries.sort((a, b) => b.overdueCount - a.overdueCount);
}

interface ApiMember {
  role: { name: string } | null;
  member: { name: string } | null;
  startDate: string;
  endDate: string | null;
}

async function fetchChairName(committeeId: string): Promise<string | null> {
  try {
    const data = await apiFetch<ApiCollection<ApiMember>>(
      `/api/Committees/${committeeId}/Members`,
      { Take: "50", Skip: "0" }
    );
    const chair = (data.items ?? []).find(
      (m) =>
        m.endDate === null &&
        m.role?.name?.toLowerCase().includes("chair")
    );
    return chair?.member?.name ?? null;
  } catch {
    return null;
  }
}

export async function getCommitteeSummary(
  id: string
): Promise<CommitteeSummary> {
  const committeeId = Number(id);
  const [details, reports, chairName] = await Promise.all([
    apiFetch<ApiCommitteeDetails>(`/api/Committees/${id}`),
    fetchReportsForCommittee(committeeId, {} as ApiCommitteeSummary),
    fetchChairName(id),
  ]);

  // Enrich reports with committee details since we passed an empty fallback
  const enriched = reports.map((r) => ({
    ...r,
    committeeName: details.name?.trim() ?? r.committeeName,
    departmentName:
      details.scrutinisingDepartments?.find((d) => d.name?.trim())?.name?.trim() ??
      r.departmentName,
  }));

  return {
    id: committeeId,
    name: details.name?.trim() ?? "Unknown Committee",
    departmentName:
      details.scrutinisingDepartments?.find((d) => d.name?.trim())?.name?.trim() ??
      "Unknown Department",
    chairName,
    overdueReports: enriched
      .filter(isOverdue)
      .sort((a, b) => daysOverdue(b) - daysOverdue(a)),
    pendingReports: enriched.filter(isPending),
    respondedReports: enriched.filter((r) => !!r.governmentResponseDate),
  };
}

export async function getReport(id: string): Promise<CommitteeReport> {
  const pub = await apiFetch<ApiPublication>(`/api/Publications/${id}`);
  return normalisePublication(pub);
}

export async function getOverallStats(): Promise<OverallStats> {
  const summaries = await getAllDepartmentSummaries();

  const totalOverdue = summaries.reduce((n, d) => n + d.overdueCount, 0);
  const totalPending = summaries.reduce((n, d) => n + d.pendingCount, 0);

  const allReports = summaries.flatMap((d) =>
    d.committees.flatMap((c) => [
      ...c.overdueReports,
      ...c.pendingReports,
      ...c.respondedReports,
    ])
  );

  return {
    totalOverdue,
    totalPending,
    respondedLast30Days: allReports.filter((r) =>
      respondedWithinDays(r, 30)
    ).length,
    mostOverdueDepartment: summaries[0]?.departmentName ?? "None",
    longestOutstandingDays: summaries.reduce(
      (max, d) => Math.max(max, d.longestOverdueDays ?? 0),
      0
    ),
  };
}
