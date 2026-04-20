import type { Id } from "@convex/_generated/dataModel";
import type { Mood, WeatherCondition, ScoreBreakdown } from "@shared/types";

export const DISPLAY_OUTFIT_COUNT = 8;

/** Display shape for one garment in the recommendation grid (from Convex doc + UI fields). */
export interface DisplayGarment {
  id: Id<"garments">;
  src: string;
  name: string;
  category: string;
  type: string;
  color: string;
  traits: {
    style?: string[];
    fit?: string;
    occasion?: string[];
    versatility?: string;
    vibrancy?: string;
  };
}

/** One outfit as shown in the home grid (label + resolved garments + context). */
export interface DisplayOutfit {
  label: string;
  garments: DisplayGarment[];
  explanation: string;
  contextMood?: Mood;
  contextWeather?: WeatherCondition;
  contextTemperature?: number;
  scoreBreakdown?: ScoreBreakdown;
}
