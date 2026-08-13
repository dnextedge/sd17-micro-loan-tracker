import { describe, expect, it } from "vitest";
import { allocateRepayment } from "@/lib/repayment-allocation";

const schedules = [
  { installmentNumber: 1, outstandingAmount: 2_000_000 },
  { installmentNumber: 2, outstandingAmount: 2_000_000 },
  { installmentNumber: 3, outstandingAmount: 2_000_000 },
];

describe("repayment allocation", () => {
  it("allocates a partial repayment to the oldest installment", () => {
    expect(allocateRepayment(500_000, schedules)).toEqual([
      { amount: 500_000, installmentNumber: 1 },
    ]);
  });

  it("allocates a payment across installments in order", () => {
    expect(allocateRepayment(3_500_000, schedules)).toEqual([
      { amount: 2_000_000, installmentNumber: 1 },
      { amount: 1_500_000, installmentNumber: 2 },
    ]);
  });

  it("allocates a full repayment exactly", () => {
    expect(allocateRepayment(6_000_000, schedules)).toHaveLength(3);
  });

  it("rejects negative payments and overpayments", () => {
    expect(() => allocateRepayment(-1, schedules)).toThrow();
    expect(() => allocateRepayment(6_000_001, schedules)).toThrow();
  });
});
