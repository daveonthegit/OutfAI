"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { WeatherCondition } from "@shared/types";
import { codeToWeatherLabel } from "@/lib/home/weather-utils";

const LAST_CITY_KEY = "outfai_last_weather_city";

export function useHomeWeather() {
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [temperatureCelsius, setTemperatureCelsius] = useState<number | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState("");
  const [weatherCityLoading, setWeatherCityLoading] = useState(false);

  const displayTemp =
    temperatureCelsius === null
      ? null
      : tempUnit === "F"
        ? Math.round(temperatureCelsius * (9 / 5) + 32)
        : temperatureCelsius;

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;
          const url = `/api/weather?lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, { credentials: "include" });
          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(
              (errBody as { error?: string })?.error ??
                `Weather request failed (${res.status})`
            );
          }
          const data = await res.json();

          const temp = data?.current?.temperature_2m;
          const code = data?.current?.weather_code;

          setLastFetched(new Date().toISOString());

          if (typeof temp === "number") setTemperatureCelsius(Math.round(temp));
          if (typeof code === "number") setWeather(codeToWeatherLabel(code));

          setLocationError(null);
        } catch (e: unknown) {
          setLocationError(
            e instanceof Error ? e.message : "Failed to fetch weather."
          );
        }
      },
      (err) => {
        setLocationError(err.message || "Location permission denied.");
      }
    );
  }, []);

  const fetchWeatherByCity = useCallback(async () => {
    const city = cityInput.trim();
    if (!city || city.length < 2) return;
    setWeatherCityLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg =
          (errBody as { error?: string })?.error ?? "Could not get weather";
        if (res.status === 400 && msg.includes("not found")) {
          toast.error("City not found. Try another name.");
          return;
        }
        throw new Error(msg);
      }
      const data = await res.json();
      const temp = data?.current?.temperature_2m;
      const code = data?.current?.weather_code;
      setLastFetched(new Date().toISOString());
      if (typeof temp === "number") setTemperatureCelsius(Math.round(temp));
      if (typeof code === "number") setWeather(codeToWeatherLabel(code));
      setLocationError(null);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(LAST_CITY_KEY, city);
      }
      toast.success(`Weather set for ${city}`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not get weather for that city"
      );
    } finally {
      setWeatherCityLoading(false);
    }
  }, [cityInput]);

  useEffect(() => {
    if (locationError && !cityInput && typeof localStorage !== "undefined") {
      const last = localStorage.getItem(LAST_CITY_KEY);
      if (last) setCityInput(last);
    }
  }, [locationError, cityInput]);

  return {
    weather,
    temperatureCelsius,
    locationError,
    tempUnit,
    setTempUnit,
    displayTemp,
    lastFetched,
    cityInput,
    setCityInput,
    weatherCityLoading,
    fetchWeatherByCity,
  };
}
