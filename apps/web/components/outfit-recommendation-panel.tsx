import React, { useState } from "react";
import { Mood, WeatherCondition } from "@/../../shared/types";
import { useOutfitRecommendations } from "@/hooks/use-outfit-recommendations";

/**
 * OutfitRecommendationPanel
 *
 * UI component for generating and displaying outfit recommendations.
 */

interface OutfitRecommendationPanelProps {
  userId: string;
}

const MOODS: Mood[] = [
  "casual",
  "formal",
  "adventurous",
  "cozy",
  "energetic",
  "minimalist",
  "bold",
];

const WEATHER_CONDITIONS: WeatherCondition[] = [
  "sunny",
  "cloudy",
  "rainy",
  "snowy",
  "windy",
  "hot",
  "cold",
];

export function OutfitRecommendationPanel({
  userId,
}: OutfitRecommendationPanelProps) {
  const [selectedMood, setSelectedMood] = useState<Mood>("casual");
  const [selectedWeather, setSelectedWeather] =
    useState<WeatherCondition>("sunny");
  const [temperature, setTemperature] = useState(20);

  const { outfits, loading, error, explanation, generate } =
    useOutfitRecommendations({
      userId,
      mood: selectedMood,
      weather: selectedWeather,
      temperature,
      limitCount: 5,
    });

  const handleGenerate = async () => {
    await generate({
      mood: selectedMood,
      weather: selectedWeather,
      temperature,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Outfit Recommendation Engine</h1>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Mood Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              How are you feeling?
            </label>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value as Mood)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {MOODS.map((mood) => (
                <option key={mood} value={mood}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Weather Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Weather condition
            </label>
            <select
              value={selectedWeather}
              onChange={(e) =>
                setSelectedWeather(e.target.value as WeatherCondition)
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              {WEATHER_CONDITIONS.map((weather) => (
                <option key={weather} value={weather}>
                  {weather.charAt(0).toUpperCase() + weather.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Temperature: {temperature}°C
            </label>
            <input
              type="range"
              min="-20"
              max="40"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Outfits"}
        </button>

        {/* Explanation */}
        {explanation && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">{explanation}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}
      </div>

      {/* Outfits Grid */}
      {outfits.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            Recommended Outfits ({outfits.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outfits.map((outfit) => (
              <div
                key={outfit.id}
                className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold">
                    Outfit #{outfits.indexOf(outfit) + 1}
                  </h3>
                  <div className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded">
                    Score: {outfit.score}%
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4">
                  {outfit.explanation}
                </p>

                {/* Garment IDs (would be expanded to show full garment details in real app) */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Pieces:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {outfit.garmentIds.map((gId) => (
                      <span
                        key={gId}
                        className="px-2 py-1 bg-gray-200 rounded text-xs"
                      >
                        {gId}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50">
                    Save
                  </button>
                  <button className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50">
                    Shuffle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && outfits.length === 0 && !error && (
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Select your mood and weather, then click "Generate Outfits" to get
            started.
          </p>
        </div>
      )}
    </div>
  );
}
