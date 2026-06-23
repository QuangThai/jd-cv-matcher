/**
 * Central environment check for DB-dependent features.
 *
 * Set DISABLE_DB_FEATURES=true on Vercel / production when
 * SQLite is not available (serverless read-only filesystem).
 *
 * NEXT_PUBLIC_DISABLE_DB_FEATURES is for client-side toggling.
 */

export const isDbDisabled =
  process.env.DISABLE_DB_FEATURES === "true" ||
  process.env.NEXT_PUBLIC_DISABLE_DB_FEATURES === "true";
