import { useMemo } from "react";
import type { Mood, UserStylePreferences } from "@shared/types";

/** Payload shape from `api.userPreferences.get` (explicit row + derived learned). */
export type UserPreferencesGetPayload = {
  explicit: {
    favoriteMoods?: string[];
    preferredStyles?: string[];
    preferredColors?: string[];
    avoidedColors?: string[];
  } | null;
  learned: {
    favoriteMoods: string[];
    preferredStyles: string[];
    preferredColors: string[];
  };
} | null;

/** Maps Convex userPreferences.get result to the shape expected by the recommendation API. */
export function useStylePreferencesFromConvex(
  userPrefsRaw: UserPreferencesGetPayload | undefined
): UserStylePreferences | undefined {
  return useMemo((): UserStylePreferences | undefined => {
    if (!userPrefsRaw) return undefined;
    const ex = userPrefsRaw.explicit;
    return {
      explicit: ex
        ? {
            favoriteMoods: (ex.favoriteMoods?.filter(Boolean) ?? []) as Mood[],
            preferredStyles: ex.preferredStyles,
            preferredColors: ex.preferredColors,
            avoidedColors: ex.avoidedColors,
          }
        : undefined,
      learned: userPrefsRaw.learned
        ? {
            favoriteMoods: (userPrefsRaw.learned.favoriteMoods?.filter(
              Boolean
            ) ?? []) as Mood[],
            preferredStyles: userPrefsRaw.learned.preferredStyles,
            preferredColors: userPrefsRaw.learned.preferredColors,
          }
        : undefined,
    };
  }, [userPrefsRaw]);
}
