import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  TECH_STAFF: "Technical Staff",
  CUSTODIAN: "Custodian",
  INSTRUCTOR: "Instructor",
}

export function formatRole(role: string | null | undefined) {
  if (!role) return ""
  return ROLE_LABELS[role] ?? formatEnum(role)
}

// UPPER_SNAKE enum value -> "Title Case" label, e.g. IN_ROOM_VERIFIED -> "In Room Verified".
export function formatEnum(value: string | null | undefined) {
  if (!value) return ""
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function fullName(person: { firstName?: string | null; lastName?: string | null } | null | undefined) {
  if (!person) return ""
  return [person.firstName, person.lastName].filter(Boolean).join(" ")
}

export function initials(person: { firstName?: string | null; lastName?: string | null } | null | undefined) {
  if (!person) return ""
  return `${person.firstName?.charAt(0) ?? ""}${person.lastName?.charAt(0) ?? ""}`.toUpperCase()
}
