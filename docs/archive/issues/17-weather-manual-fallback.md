# Manual weather fallback (city input)

**Labels:** `weather`, `ux`, `enhancement`

## Description

When the user denies geolocation or it fails, there is no way to set location. MVP features (F4) require a manual city input fallback so weather can still be shown and used for recommendations.

## Tasks

- [ ] Add optional "Set location" or "Enter city" on the Today page when `locationError` is set or when user has not granted geolocation.
- [ ] Use Open-Meteo geocoding or a simple city → lat/lng lookup (e.g. Open-Meteo city search or static list of major cities) to fetch weather for the chosen city.
- [ ] Persist last-used city in `userPreferences` (optional) so returning users don’t have to re-enter.
- [ ] Keep "Use my location" so users can switch back to geolocation.

## Acceptance criteria

- If geolocation is denied or fails, user can enter a city and see weather + get recommendations.
- Weather badge and recommendations use the manual city when set.

## References

- apps/web/app/page.tsx (locationError, Open-Meteo fetch)
- docs/mvp-features.md F4
