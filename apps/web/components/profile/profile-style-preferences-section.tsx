"use client";

import { toggleStringInList } from "@/lib/profile/toggle-string-in-list";
import {
  COLOR_CHIPS,
  PREFERRED_STYLE_CHIPS,
  PROFILE_MOODS,
  STYLE_GOAL_MAX_LENGTH,
} from "@/components/profile/profile-constants";

type ProfileStylePreferencesSectionProps = {
  favoriteMoods: string[];
  setFavoriteMoods: (next: string[]) => void;
  styleGoal: string;
  setStyleGoal: (v: string) => void;
  preferredStyles: string[];
  setPreferredStyles: (next: string[]) => void;
  preferredColors: string[];
  setPreferredColors: (next: string[]) => void;
  avoidedColors: string[];
  setAvoidedColors: (next: string[]) => void;
  preferencesSuccess: string;
  onSavePreferences: () => void;
};

export function ProfileStylePreferencesSection({
  favoriteMoods,
  setFavoriteMoods,
  styleGoal,
  setStyleGoal,
  preferredStyles,
  setPreferredStyles,
  preferredColors,
  setPreferredColors,
  avoidedColors,
  setAvoidedColors,
  preferencesSuccess,
  onSavePreferences,
}: ProfileStylePreferencesSectionProps) {
  return (
    <section className="mb-12">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
        Style Preferences
      </p>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Favorite moods
        </p>
        <div className="flex flex-wrap gap-2">
          {PROFILE_MOODS.map((mood) => {
            const active = favoriteMoods.includes(mood);
            return (
              <button
                key={mood}
                type="button"
                onClick={() =>
                  setFavoriteMoods(toggleStringInList(mood, favoriteMoods))
                }
                className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 cursor-pointer ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground"
                }`}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Style goal
        </p>
        <input
          type="text"
          value={styleGoal}
          onChange={(e) => setStyleGoal(e.target.value)}
          maxLength={STYLE_GOAL_MAX_LENGTH}
          placeholder="e.g. Minimalist with a pop of color"
          className="w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          {styleGoal.length}/{STYLE_GOAL_MAX_LENGTH}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Preferred styles
        </p>
        <div className="flex flex-wrap gap-2">
          {PREFERRED_STYLE_CHIPS.map((style) => {
            const active = preferredStyles.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() =>
                  setPreferredStyles(toggleStringInList(style, preferredStyles))
                }
                className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 cursor-pointer ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Preferred colors
        </p>
        <div className="flex flex-wrap gap-2">
          {COLOR_CHIPS.map((color) => {
            const active = preferredColors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() =>
                  setPreferredColors(toggleStringInList(color, preferredColors))
                }
                className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 cursor-pointer ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground"
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Colors to avoid
        </p>
        <div className="flex flex-wrap gap-2">
          {COLOR_CHIPS.map((color) => {
            const active = avoidedColors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() =>
                  setAvoidedColors(toggleStringInList(color, avoidedColors))
                }
                className={`px-3 py-1 text-[11px] uppercase tracking-[0.16em] border transition-colors duration-100 cursor-pointer ${
                  active
                    ? "border-destructive bg-destructive text-background"
                    : "border-border text-muted-foreground hover:border-destructive"
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {preferencesSuccess && (
        <p className="text-xs uppercase tracking-wider text-foreground mb-2">
          {preferencesSuccess}
        </p>
      )}
      <button
        type="button"
        onClick={onSavePreferences}
        className="mt-2 flex items-center justify-between w-full border border-border px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-foreground transition-colors duration-100 cursor-pointer"
      >
        <span>Save Preferences</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </section>
  );
}
