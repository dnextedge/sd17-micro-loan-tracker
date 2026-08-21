import { describe, expect, it } from "vitest";
import {
  buildFullName,
  EMPLOYMENT_TYPES,
  NIGERIAN_STATES,
} from "./profile-options";

describe("profile options", () => {
  it("contains all 36 states and the Federal Capital Territory", () => {
    expect(NIGERIAN_STATES).toHaveLength(37);
    expect(NIGERIAN_STATES).toContain("Akwa Ibom");
    expect(NIGERIAN_STATES).toContain("Federal Capital Territory");
  });

  it("provides controlled employment choices", () => {
    expect(EMPLOYMENT_TYPES).toContain("Employed");
    expect(EMPLOYMENT_TYPES).toContain("Self-employed");
    expect(EMPLOYMENT_TYPES).toContain("Business owner");
    expect(EMPLOYMENT_TYPES).toContain("Not employed");
  });

  it("builds a display name and omits a blank middle name", () => {
    expect(
      buildFullName({ firstName: "Emem", middleName: "", lastName: "James" }),
    ).toBe("Emem James");
  });
});
