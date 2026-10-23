import type {
  WelfareGender,
  WelfareMembershipDuration,
  WelfareMembershipStatus,
  WelfareStatus,
  WelfareSupportType,
} from "@nb-church/db";

// Single source of truth for the welfare form's option lists and the labels
// shown in the public form, the notification email and the admin panel.

export const WELFARE_GENDER_LABELS: Record<WelfareGender, string> = {
  MALE: "Male",
  FEMALE: "Female",
};

export const WELFARE_MEMBERSHIP_STATUS_LABELS: Record<WelfareMembershipStatus, string> = {
  REGISTERED: "Registered",
  UNREGISTERED: "Unregistered",
};

export const WELFARE_DURATION_LABELS: Record<WelfareMembershipDuration, string> = {
  LT_1_MONTH: "Less than 1 month",
  LT_1_YEAR: "Less than 1 year",
  LT_3_YEARS: "Less than 3 years",
  THREE_YEARS: "3 years",
  GT_3_YEARS: "More than 3 years",
};

export const WELFARE_SUPPORT_LABELS: Record<WelfareSupportType, string> = {
  EMPLOYMENT: "Employment help",
  SCHOOL_FEES: "School fees",
  FOOD: "Food items",
  FINANCIAL: "Financial",
  MEDICAL: "Medical",
  RENT: "Rent",
  OTHER: "Other",
};

export const WELFARE_STATUS_LABELS: Record<WelfareStatus, string> = {
  NEW: "New",
  IN_REVIEW: "In review",
  ASSISTED: "Assisted",
  CLOSED: "Closed",
};

export function labelEntries<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

/** "Rent" or, for OTHER, "Other: <text>". */
export function describeSupport(type: WelfareSupportType, other?: string | null): string {
  return type === "OTHER" && other ? `Other: ${other}` : WELFARE_SUPPORT_LABELS[type];
}
