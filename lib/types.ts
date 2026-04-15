// ─── Internal app types ───────────────────────────────────────────────────────

export interface CommitteeReport {
  id: number;
  title: string;
  reportPublishedDate: string; // ISO date string
  governmentResponseDate: string | null;
  committeeId: number;
  committeeName: string;
  departmentName: string;
  reportUrl: string;
  governmentResponseUrl: string | null;
}

export interface CommitteeSummary {
  id: number;
  name: string;
  departmentName: string;
  chairName: string | null;
  overdueReports: CommitteeReport[];
  pendingReports: CommitteeReport[];
  respondedReports: CommitteeReport[];
}

export interface DepartmentSummary {
  departmentName: string;
  committees: CommitteeSummary[];
  overdueCount: number;
  pendingCount: number;
  respondedCount: number;
  longestOverdueDays: number | null;
}

export interface OverallStats {
  totalOverdue: number;
  totalPending: number;
  respondedLast30Days: number;
  mostOverdueDepartment: string;
  longestOutstandingDays: number;
}

export type BadgeStatus = "overdue" | "pending" | "responded";

// ─── Raw API shapes from committees-api.parliament.uk ─────────────────────────

export interface ApiPublicationSummary {
  id: number;
  publicationStartDate: string | null;
  additionalContentUrl: string | null;
}

export interface ApiGovernmentResponse {
  publication: ApiPublicationSummary[] | null;
  responseDeadline: string | null;
  responseExcepted: boolean;
}

export interface ApiScrutinisingDepartment {
  id: number;
  name: string;
}

export interface ApiCommitteeSummary {
  id: number;
  name: string | null;
  scrutinisingDepartments: ApiScrutinisingDepartment[] | null;
  house?: { value: string; name: string } | null;
}

export interface ApiPublication {
  id: number;
  description: string | null;
  publicationStartDate: string | null;
  governmentResponses: ApiGovernmentResponse | null;
  additionalContentUrl: string | null;
  additionalContentUrl2: string | null;
  committee: ApiCommitteeSummary | null;
}

export interface ApiCommitteeDetails extends ApiCommitteeSummary {
  purpose: string | null;
}

export interface ApiCollection<T> {
  items: T[] | null;
  totalResults: number;
  itemsPerPage: number;
}
