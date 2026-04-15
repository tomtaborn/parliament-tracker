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

// Raw API shapes from committees.api.parliament.uk
export interface ApiReport {
  id: number;
  title: string;
  reportPublishedDate: string;
  governmentResponseDate: string | null;
  committee?: {
    id: number;
    name: string;
    parentDepartment?: { name: string };
    currentChair?: { name: string } | null;
  };
  reportPublicationUrl?: string;
  governmentResponsePublicationUrl?: string | null;
}

export interface ApiCommittee {
  id: number;
  name: string;
  parentDepartment?: { name: string };
  currentChair?: { name: string } | null;
}
