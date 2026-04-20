import { describe, it, expect } from "vitest";
import { codeToWeatherLabel, weatherLabelToDisplay } from "./weather-utils";

describe("codeToWeatherLabel", () => {
  it("maps clear sky to sunny", () => {
    expect(codeToWeatherLabel(0)).toBe("sunny");
  });

  it("maps thunderstorm codes to rainy", () => {
    expect(codeToWeatherLabel(95)).toBe("rainy");
    expect(codeToWeatherLabel(96)).toBe("rainy");
    expect(codeToWeatherLabel(99)).toBe("rainy");
  });

  it("maps snow codes to snowy", () => {
    expect(codeToWeatherLabel(71)).toBe("snowy");
    expect(codeToWeatherLabel(86)).toBe("snowy");
  });

  it("maps drizzle and rain codes to rainy", () => {
    expect(codeToWeatherLabel(61)).toBe("rainy");
    expect(codeToWeatherLabel(82)).toBe("rainy");
  });

  it("defaults unknown codes to cloudy", () => {
    expect(codeToWeatherLabel(9999)).toBe("cloudy");
  });
});

describe("weatherLabelToDisplay", () => {
  it("returns empty string for null (loading is rendered in UI)", () => {
    expect(weatherLabelToDisplay(null)).toBe("");
  });

  it("maps known labels", () => {
    expect(weatherLabelToDisplay("sunny")).toBe("Sunny");
    expect(weatherLabelToDisplay("foggy")).toBe("Foggy");
  });
});
