import type { Database } from "@/types/database.types";

export type LoanStatus = Database["public"]["Enums"]["loan_status"];

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  active: "Active",
  approved: "Approved",
  cancelled: "Cancelled",
  completed: "Completed",
  defaulted: "Defaulted",
  disbursed: "Disbursed",
  fully_repaid: "Fully repaid",
  overdue: "Overdue",
};

export function loanStatusBadgeClass(status: LoanStatus) {
  if (["active", "fully_repaid", "completed"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["overdue", "defaulted", "cancelled"].includes(status)) {
    return "border-red-200 bg-red-50 text-red-800";
  }
  if (status === "disbursed") {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }
  return "border-amber-200 bg-amber-50 text-amber-800";
}
