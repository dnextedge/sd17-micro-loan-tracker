import type { Database } from "@/types/database.types";

export type ApplicationStatus =
  Database["public"]["Enums"]["application_status"];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  approved: "Approved",
  cancelled: "Cancelled",
  draft: "Draft",
  rejected: "Rejected",
  submitted: "Submitted",
  under_review: "Under review",
};

export function statusBadgeClass(status: ApplicationStatus) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "rejected":
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-800";
    case "under_review":
      return "border-blue-200 bg-blue-50 text-blue-800";
    default:
      return "border-amber-200 bg-amber-50 text-amber-800";
  }
}
