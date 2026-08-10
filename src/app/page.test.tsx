import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("LoanTrack NG foundation page", () => {
  it("identifies the product and capstone project", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /micro-loan tracking, made clear/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/3MTT NextGen Cohort Capstone/i)).toBeVisible();
    expect(screen.getByText(/SD-17 — Micro-Loan Tracker/i)).toBeVisible();
  });

  it("does not present the application as a licensed lender", () => {
    render(<Home />);

    expect(
      screen.getByText(/tracking system, not a licensed lender/i),
    ).toBeVisible();
  });
});
