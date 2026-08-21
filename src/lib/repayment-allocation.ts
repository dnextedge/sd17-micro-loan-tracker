export type ScheduleBalance = {
  installmentNumber: number;
  outstandingAmount: number;
};

export type Allocation = {
  amount: number;
  installmentNumber: number;
};

export function allocateRepayment(
  amount: number,
  schedules: ScheduleBalance[],
): Allocation[] {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new RangeError("Repayment must be a positive integer kobo amount");
  }

  const totalOutstanding = schedules.reduce((total, schedule) => {
    if (
      !Number.isSafeInteger(schedule.outstandingAmount) ||
      schedule.outstandingAmount < 0
    ) {
      throw new RangeError("Schedule balances must be non-negative integers");
    }
    return total + schedule.outstandingAmount;
  }, 0);
  if (amount > totalOutstanding)
    throw new RangeError("Repayment exceeds balance");

  let remaining = amount;
  const allocations: Allocation[] = [];
  for (const schedule of schedules) {
    if (remaining === 0) break;
    const allocated = Math.min(remaining, schedule.outstandingAmount);
    if (allocated > 0) {
      allocations.push({
        amount: allocated,
        installmentNumber: schedule.installmentNumber,
      });
      remaining -= allocated;
    }
  }
  return allocations;
}
