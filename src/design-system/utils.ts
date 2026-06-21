/**
 * Lightweight className combiner (no external deps).
 * Filters falsy values and joins with spaces.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
