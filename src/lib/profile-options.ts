export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export const EMPLOYMENT_TYPES = [
  "Employed",
  "Self-employed",
  "Business owner",
  "Student",
  "Retired",
  "Not employed",
  "Other",
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export function buildFullName(parts: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
}) {
  return [parts.firstName, parts.middleName, parts.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}
