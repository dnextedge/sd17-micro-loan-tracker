import { describe, expect, it } from "vitest";
import {
  calculateLoanTerms,
  scheduledInstallmentAmounts,
} from "@/lib/loan-calculations";

describe("loan calculations", () => {
  it("calculates a zero-interest demonstration loan", () => {
    expect(calculateLoanTerms(12_000_000, 0, 6)).toEqual({
      installmentAmount: 2_000_000,
      interestAmount: 0,
      totalRepayable: 12_000_000,
    });
  });

  it("calculates percentage interest using integer arithmetic", () => {
    expect(calculateLoanTerms(12_000_000, 250, 6)).toEqual({
      installmentAmount: 2_050_000,
      interestAmount: 300_000,
      totalRepayable: 12_300_000,
    });
  });

  it("keeps schedule rounding exact by adjusting the final installment", () => {
    const amounts = scheduledInstallmentAmounts(10_000, 3);

    expect(amounts).toEqual([3_334, 3_334, 3_332]);
    expect(amounts.reduce((sum, amount) => sum + amount, 0)).toBe(10_000);
  });

  it("rejects invalid financial inputs", () => {
    expect(() => calculateLoanTerms(-1, 0, 6)).toThrow();
    expect(() => calculateLoanTerms(100_000, -1, 6)).toThrow();
    expect(() => scheduledInstallmentAmounts(100_000, 0)).toThrow();
  });
});
