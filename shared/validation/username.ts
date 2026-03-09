/**
 * Single source of truth for username validation and normalization.
 * Align with Better Auth username plugin: default alphanumeric, underscores, dots; min 3, max 30; stored lowercase.
 */

import { z } from "zod";

/** Min length (Better Auth default). */
export const USERNAME_MIN_LENGTH = 3;

/** Max length (Better Auth default). */
export const USERNAME_MAX_LENGTH = 30;

/** Allowed characters: letters, numbers, underscore, dot. No spaces. */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;

/** Reserved usernames that cannot be claimed. */
export const RESERVED_USERNAMES = new Set(
  [
    "admin",
    "administrator",
    "outfai",
    "support",
    "help",
    "info",
    "root",
    "system",
    "null",
    "undefined",
    "api",
    "www",
    "mail",
    "contact",
    "login",
    "signup",
    "signin",
    "logout",
    "profile",
    "settings",
    "account",
    "user",
    "users",
  ].map((s) => s.toLowerCase())
);

const usernameSchema = z
  .string()
  .trim()
  .min(
    USERNAME_MIN_LENGTH,
    `Username must be at least ${USERNAME_MIN_LENGTH} characters`
  )
  .max(
    USERNAME_MAX_LENGTH,
    `Username must be at most ${USERNAME_MAX_LENGTH} characters`
  )
  .regex(
    USERNAME_PATTERN,
    "Username can only contain letters, numbers, underscores, and periods"
  )
  .refine(
    (val) => !RESERVED_USERNAMES.has(val.toLowerCase()),
    "This username is reserved"
  );

/**
 * Validates and normalizes username for storage/display.
 * Returns normalized (lowercase) value; use for uniqueness checks and storage.
 * Throws ZodError on invalid input.
 */
export function validateUsername(value: string): string {
  const parsed = usernameSchema.parse(value);
  return parsed.toLowerCase();
}

/**
 * Safe validation: returns { success: true, value } or { success: false, error: string }.
 */
export function parseUsername(
  value: string
): { success: true; value: string } | { success: false; error: string } {
  const result = usernameSchema.safeParse(value.trim());
  if (result.success) {
    return { success: true, value: result.data.toLowerCase() };
  }
  const first = result.error.flatten().formErrors[0];
  return { success: false, error: first ?? "Invalid username" };
}

/** Zod schema for use in forms (e.g. react-hook-form + zod resolver). */
export const usernameSchemaExport = usernameSchema.transform((s) =>
  s.toLowerCase()
);
