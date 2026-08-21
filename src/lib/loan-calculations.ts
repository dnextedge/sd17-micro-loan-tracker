export type LoanTerms = {
  installmentAmount: number;
  interestAmount: number;
  totalRepayable: number;
};

function safeNumber(value: bigint) {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError("Calculated money value exceeds the supported range");
  }
  return Number(value);
}

export function calculateLoanTerms(
  principalKobo: number,
  interestRateBasisPoints: number,
  repaymentDurationMonths: number,
): LoanTerms {
  if (!Number.isSafeInteger(principalKobo) || principalKobo <= 0) {
    throw new RangeError("Principal must be a positive integer kobo amount");
  }
  if (
    !Number.isInteger(interestRateBasisPoints) ||
    interestRateBasisPoints < 0 ||
    interestRateBasisPoints > 1_000_000
  ) {
    throw new RangeError("Interest rate must be between 0 and 100 percent");
  }
  if (
    !Number.isInteger(repaymentDurationMonths) ||
    repaymentDurationMonths < 1 ||
    repaymentDurationMonths > 60
  ) {
    throw new RangeError("Repayment duration must be between 1 and 60 months");
  }

  const principal = BigInt(principalKobo);
  const interest =
    (principal * BigInt(interestRateBasisPoints) + BigInt(5_000)) /
    BigInt(10_000);
  const total = principal + interest;
  const duration = BigInt(repaymentDurationMonths);
  const installment = (total + duration - BigInt(1)) / duration;

  return {
    installmentAmount: safeNumber(installment),
    interestAmount: safeNumber(interest),
    totalRepayable: safeNumber(total),
  };
}

export function scheduledInstallmentAmounts(
  totalRepayable: number,
  repaymentDurationMonths: number,
) {
  if (!Number.isSafeInteger(totalRepayable) || totalRepayable <= 0) {
    throw new RangeError("Total repayable must be a positive integer amount");
  }
  if (
    !Number.isInteger(repaymentDurationMonths) ||
    repaymentDurationMonths < 1
  ) {
    throw new RangeError("Repayment duration must be positive");
  }

  const duration = BigInt(repaymentDurationMonths);
  const total = BigInt(totalRepayable);
  const regular = (total + duration - BigInt(1)) / duration;
  const finalAmount = total - regular * (duration - BigInt(1));

  return Array.from({ length: repaymentDurationMonths }, (_, index) =>
    safeNumber(index === repaymentDurationMonths - 1 ? finalAmount : regular),
  );
}
