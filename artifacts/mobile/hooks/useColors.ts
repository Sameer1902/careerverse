import colors from "@/constants/colors";

/**
 * Always returns the dark palette — CareerPath India is a dark-themed app.
 * Includes scheme-independent values like `radius`.
 */
export function useColors() {
  const palette = (colors as Record<string, typeof colors.light>).dark ?? colors.light;
  return { ...palette, radius: colors.radius };
}
