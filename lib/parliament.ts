import type {
  ApiCommittee,
  ApiReport,
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

const BASE = "https://committees.api.parliament.uk/api/v1";

const CACHE: RequestInit = { next: { revalidate: 21600 } }; // 6 hours

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), CACHE);

  if (!res.ok) {
    throw new Error(`Parliament API error: ${res.status} ${res.statusText} (${url})`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Normalisers — map API shapes to our internal types
// ---------------------------------------------------------------------------

function normaliseReport(raw: ApiReport, committee?: ApiCommittee): CommitteeReport {
  const c = raw.committee ?? committee;
  return {
    id: raw.id,
    title: raw.title,
    reportPublishedDate: raw.reportPublishedDate,
    governmentResponseDate: raw.governmentResponseDate ?? null,
    committeeId: c?.id ?? 0,
    committeeName: c?.name ?? "Unknown Committee",
    departmentName: c?.parentDepartment?.name ?? "Unknown Department",
    reportUrl:
      raw.reportPublicationUrl ??
      `https://committees.parliament.uk/work/reports/${raw.id}/`,
    governmentResponseUrl: raw.governmentResponsePublicationUrl ?? null,
  };
}

// ---------------------------------------------------------------------------
// Raw API fetches
// ---------------------------------------------------------------------------

interface ApiReportsResponse {
  items: ApiReport[];
  totalResults: number;
}

interface ApiCommitteesResponse {
  items: ApiCommittee[];
  totalResults: number;
}

async function fetchAllReports(): Promise<CommitteeReport[]> {
  const pageSize = 50;
  const reports: CommitteeReport[] = [];

  // Fetch first page to get total
  const first = await apiFetch<ApiReportsResponse>("/Reports", {
    house: "Commons",
    skip: "0",
    take: String(pageSize),
  });

  const total = first.totalResults ?? first.items.length;
  first.items.forEach((r) => reports.push(normaliseReport(r)));

  // Fetch remaining pages in parallel
  const pages = Math.ceil(total / pageSize);
  const fetches = Array.from({ length: pages - 1 }, (_, i) =>
    apiFetch<ApiReportsResponse>("/Reports", {
      house: "Commons",
      skip: String((i + 1) * pageSize),
      take: String(pageSize),
    })
  );

  const rest = await Promise.allSettled(fetches);
  rest.forEach((result) => {
    if (result.status === "fulfilled") {
      result.value.items.forEach((r) => reports.push(normaliseReport(r)));
    }
  });

  return reports;
}

async function fetchAllCommittees(): Promise<ApiCommittee[]> {
  const pageSize = 50;
  const committees: ApiCommittee[] = [];

  const first = await apiFetch<ApiCommitteesResponse>("/Committees", {
    house: "Commons",
    skip: "0",
    take: String(pageSize),
  });

  const total = first.totalResults ?? first.items.length;
  committees.push(...first.items);

  const pages = Math.ceil(total / pageSize);
  const fetches = Array.from({ length: pages - 1 }, (_, i) =>
    apiFetch<ApiCommitteesResponse>("/Committees", {
      house: "Commons",
      skip: String((i + 1) * pageSize),
      take: String(pageSize),
    })
  );

  const rest = await Promise.allSettled(fetches);
  rest.forEach((result) => {
    if (result.status === "fulfilled") {
      committees.push(...result.value.items);
    }
  });

  return committees;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getAllDepartmentSummaries(): Promise<DepartmentSummary[]> {
  const [reports, committees] = await Promise.all([
    fetchAllReports(),
    fetchAllCommittees(),
  ]);

  // Build committee map
  const committeeMap = new Map<number, ApiCommittee>(
    committees.map((c) => [c.id, c])
  );

  // Enrich reports with committee data where missing
  const enriched = reports.map((r) => {
    if (r.departmentName !== "Unknown Department") return r;
    const c = committeeMap.get(r.committeeId);
    if (!c) return r;
    return {
      ...r,
      committeeName: c.name,
      departmentName: c.parentDepartment?.name ?? r.departmentName,
    };
  });

  // Group by department → committee
  const deptMap = new Map<string, Map<number, CommitteeReport[]>>();

  for (const report of enriched) {
    const dept = report.departmentName || "Unknown Department";
    if (!deptMap.has(dept)) deptMap.set(dept, new Map());
    const cMap = deptMap.get(dept)!;
    if (!cMap.has(report.committeeId)) cMap.set(report.committeeId, []);
    cMap.get(report.committeeId)!.push(report);
  }

  const summaries: DepartmentSummary[] = [];

  for (const [deptName, cMap] of deptMap) {
    const committeeEntries: CommitteeSummary[] = [];

    for (const [committeeId, cReports] of cMap) {
      const apiCommittee = committeeMap.get(committeeId);
      const overdue = cReports.filter(isOverdue);
      const pending = cReports.filter(isPending);
      const responded = cReports.filter((r) => !!r.governmentResponseDate);

      committeeEntries.push({
        id: committeeId,
        name: cReports[0].committeeName,
        departmentName: deptName,
        chairName: apiCommittee?.currentChair?.name ?? null,
        overdueReports: overdue.sort(
          (a, b) => daysOverdue(b) - daysOverdue(a)
        ),
        pendingReports: pending,
        respondedReports: responded,
      });
    }

    const allOverdue = committeeEntries.flatMap((c) => c.overdueReports);
    const longestDays =
      allOverdue.length > 0
        ? Math.max(...allOverdue.map(daysOverdue))
        : null;

    summaries.push({
      departmentName: deptName,
      committees: committeeEntries,
      overdueCount: allOverdue.length,
      pendingCount: committeeEntries.flatMap((c) => c.pendingReports).length,
      respondedCount: committeeEntries.flatMap((c) => c.respondedReports)
        .length,
      longestOverdueDays: longestDays,
    });
  }

  // Sort by overdue count descending
  return summaries.sort((a, b) => b.overdueCount - a.overdueCount);
}

export async function getCommitteeSummary(id: string): Promise<CommitteeSummary> {
  interface ApiCommitteeReportsResponse {
    items: ApiReport[];
    totalResults: number;
  }

  const committeeId = Number(id);

  const [committeeRaw, reportsRaw] = await Promise.all([
    apiFetch<ApiCommittee>(`/Committees/${id}`),
    apiFetch<ApiCommitteeReportsResponse>(`/Committees/${id}/Reports`, {
      skip: "0",
      take: "200",
    }),
  ]);

  const reports = reportsRaw.items.map((r) => normaliseReport(r, committeeRaw));
  const overdue = reports.filter(isOverdue).sort(
    (a, b) => daysOverdue(b) - daysOverdue(a)
  );
  const pending = reports.filter(isPending);
  const responded = reports.filter((r) => !!r.governmentResponseDate);

  return {
    id: committeeId,
    name: committeeRaw.name,
    departmentName: committeeRaw.parentDepartment?.name ?? "Unknown Department",
    chairName: committeeRaw.currentChair?.name ?? null,
    overdueReports: overdue,
    pendingReports: pending,
    respondedReports: responded,
  };
}

export async function getReport(id: string): Promise<CommitteeReport> {
  const raw = await apiFetch<ApiReport>(`/Reports/${id}`);
  return normaliseReport(raw);
}

export async function getOverallStats(): Promise<OverallStats> {
  const summaries = await getAllDepartmentSummaries();

  const totalOverdue = summaries.reduce((s, d) => s + d.overdueCount, 0);
  const totalPending = summaries.reduce((s, d) => s + d.pendingCount, 0);

  // Responded in last 30 days — need flat list of all reports
  const allReports = summaries.flatMap((d) =>
    d.committees.flatMap((c) => [
      ...c.overdueReports,
      ...c.pendingReports,
      ...c.respondedReports,
    ])
  );
  const respondedLast30Days = allReports.filter((r) =>
    respondedWithinDays(r, 30)
  ).length;

  const mostOverdueDept = summaries[0]?.departmentName ?? "None";

  const longestOutstandingDays = summaries.reduce(
    (max, d) => Math.max(max, d.longestOverdueDays ?? 0),
    0
  );

  return {
    totalOverdue,
    totalPending,
    respondedLast30Days,
    mostOverdueDepartment: mostOverdueDept,
    longestOutstandingDays,
  };
}
