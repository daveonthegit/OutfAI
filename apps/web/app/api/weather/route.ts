import {
  checkRateLimit,
  rateLimitKey,
  requireConvexUser,
} from "@/lib/api-route-helpers";
import { NextRequest, NextResponse } from "next/server";

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

type CacheEntry = {
  data: { current: { temperature_2m: number; weather_code: number } };
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

function getCacheKey(params: {
  lat?: string | null;
  lon?: string | null;
  city?: string | null;
}): string | null {
  const lat = params.lat ?? undefined;
  const lon = params.lon ?? undefined;
  const city = params.city ?? undefined;
  if (lat != null && lon != null) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
      return `lat,lon:${latNum.toFixed(4)},${lonNum.toFixed(4)}`;
    }
  }
  if (city != null && city.trim().length >= 2) {
    return `city:${city.trim().toLowerCase()}`;
  }
  return null;
}

async function fetchWeatherByCoords(lat: number, lon: number) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  const data = await res.json();
  return {
    current: {
      temperature_2m: data?.current?.temperature_2m ?? 15,
      weather_code: data?.current?.weather_code ?? 0,
    },
  };
}

async function fetchWeatherByCity(city: string) {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );
  if (!geoRes.ok) throw new Error("City lookup failed");
  const geoData = await geoRes.json();
  const results = geoData?.results;
  if (!results?.length) throw new Error("City not found");
  const { latitude, longitude } = results[0];
  return fetchWeatherByCoords(latitude, longitude);
}

const RATE_MAX = 120;
const RATE_WINDOW_MS = 60_000;

export async function GET(request: NextRequest) {
  const userOr401 = await requireConvexUser();
  if (userOr401 instanceof NextResponse) return userOr401;

  const key = rateLimitKey(request, "weather");
  if (!checkRateLimit(key, RATE_MAX, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const city = searchParams.get("city");

    const key = getCacheKey({ lat, lon, city });
    if (!key) {
      return NextResponse.json(
        { error: "Provide lat and lon, or city" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data);
    }

    let data: { current: { temperature_2m: number; weather_code: number } };
    const cityVal = searchParams.get("city");
    const latVal = searchParams.get("lat");
    const lonVal = searchParams.get("lon");
    if (cityVal != null && cityVal.trim().length >= 2) {
      data = await fetchWeatherByCity(cityVal.trim());
    } else if (latVal != null && lonVal != null) {
      const latNum = parseFloat(latVal);
      const lonNum = parseFloat(lonVal);
      if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
        return NextResponse.json(
          { error: "Invalid lat or lon" },
          { status: 400 }
        );
      }
      data = await fetchWeatherByCoords(latNum, lonNum);
    } else {
      return NextResponse.json(
        { error: "Provide lat and lon, or city" },
        { status: 400 }
      );
    }

    cache.set(key, { data, expiresAt: now + CACHE_TTL_MS });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
