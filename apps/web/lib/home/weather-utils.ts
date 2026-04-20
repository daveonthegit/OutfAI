/**
 * Maps Open-Meteo WMO weather codes to outfit-engine weather labels.
 */
export function codeToWeatherLabel(
  code: number
): "sunny" | "cloudy" | "rainy" | "snowy" | "foggy" {
  if (code === 0) return "sunny";

  if (code === 1) return "sunny";
  if (code === 2) return "cloudy";
  if (code === 3) return "cloudy";

  if (code === 45 || code === 48) return "foggy";

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "rainy";

  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowy";

  if ([95, 96, 99].includes(code)) return "rainy";

  return "cloudy";
}

import type { WeatherCondition } from "@shared/types";

export function weatherLabelToDisplay(
  weather: WeatherCondition | null
): string {
  if (weather === null) return "";
  const map: Record<WeatherCondition, string> = {
    sunny: "Sunny",
    cloudy: "Cloudy",
    rainy: "Rainy",
    snowy: "Snowy",
    foggy: "Foggy",
    windy: "Windy",
    hot: "Hot",
    cold: "Cold",
  };
  return map[weather] ?? "Cloudy";
}
