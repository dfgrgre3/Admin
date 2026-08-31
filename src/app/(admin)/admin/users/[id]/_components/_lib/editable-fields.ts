"use client";

import type { UserDetails } from "../types";

export const EDITABLE_USER_FIELDS = [
  "name",
  "username",
  "email",
  "phone",
  "role",
  "bio",
  "gradeLevel",
  "educationType",
  "section",
  "school",
  "country",
  "dateOfBirth",
  "gender",
  "studyGoal",
] as const;

export type EditableUserField = (typeof EDITABLE_USER_FIELDS)[number];

export function pickEditableUserFields(
  source: Partial<UserDetails>,
): Partial<Pick<UserDetails, EditableUserField>> {
  const result: Record<string, unknown> = {};
  for (const field of EDITABLE_USER_FIELDS) {
    if (field in source) {
      result[field] = source[field];
    }
  }
  return result as Partial<Pick<UserDetails, EditableUserField>>;
}