# Outfit Recommendation Engine

Generates context-aware outfit recommendations using mood, weather, temperature, and wardrobe inventory with explainable scoring.

## Quick Start

### 3 Ways to Use

**1. Add component to any page:**

```tsx
import { OutfitRecommendationPanel } from "@/components/outfit-recommendation-panel";

export default function StylePage() {
  return <OutfitRecommendationPanel userId="user-123" />;
}
```

**2. Use in custom component:**

```tsx
import { useOutfitRecommendations } from "@/hooks/use-outfit-recommendations";

const { outfits, loading, error, generate } = useOutfitRecommendations({
  userId: "user-123",
  mood: "casual",
});

return (
  <>
    <button onClick={() => generate()}>Generate</button>
    {loading && <p>Loading...</p>}
    {outfits.map((outfit) => (
      <div key={outfit.id}>
        Score: {outfit.score}% - {outfit.explanation}
      </div>
    ))}
  </>
);
```

**3. Direct API call:**

```typescript
const result = await trpc.recommendations.generate.query({
  userId: "user-123",
  mood: "casual",
  weather: "sunny",
  temperature: 22,
  limitCount: 5,
});
```

## Files Created

| Component | Location                                              |
| --------- | ----------------------------------------------------- |
| Service   | `server/services/outfitRecommendationService.ts`      |
| Router    | `server/api/routers/recommendations.ts`               |
| Component | `apps/web/components/outfit-recommendation-panel.tsx` |
| Hook      | `apps/web/hooks/use-outfit-recommendations.ts`        |
| Types     | `shared/types/index.ts`                               |

---

## Architecture

```
Frontend (React/TypeScript)
    ↓
React Hook (useOutfitRecommendations)
    ↓
tRPC API Endpoint (recommendations.generate)
    ↓
OutfitRecommendationService (Business Logic)
    ↓
Database / Mock Layer
```

## How It Works

### 3-Stage Pipeline

**1. Filter by Context**

- Removes unsuitable garments by weather, season, temperature
- Considers season compatibility
- Evaluates temperature suitability

**2. Generate Candidates**

- Creates outfit combinations (Tops × Bottoms × Shoes + Accessories)
- Ensures valid clothing hierarchy
- Generates multiple candidate combinations

**3. Score & Rank**

- **Color Harmony** (0-20): Complementary colors, monochromatic schemes
- **Mood Alignment** (0-20): Matches garment properties with user mood
- **Diversity** (5-10): Prefers outfits with 3+ pieces
- **Base Score**: 50 points
- **Total**: 50-100 range (capped)

### Available Options

| Option          | Values                                                         | Default |
| --------------- | -------------------------------------------------------------- | ------- |
| **Moods**       | casual, formal, adventurous, cozy, energetic, minimalist, bold | —       |
| **Weather**     | sunny, cloudy, rainy, snowy, windy, hot, cold                  | —       |
| **Temperature** | -50 to 50°C                                                    | —       |
| **Limit**       | 1-10 outfits                                                   | 5       |

## Core Components

### Service: OutfitRecommendationService

**File:** `server/services/outfitRecommendationService.ts`

Core business logic orchestrating the 3-stage pipeline.

**Key Methods:**

- `generateOutfits()` - Main entry point
- `filterByContext()` - Weather/season/temperature filtering
- `generateCandidates()` - Create combinations
- `scoreOutfit()` - Calculate quality score
- `scoreColorHarmony()` - Color coordination (0-20)
- `scoreMoodAlignment()` - Mood matching (0-20)
- `scoreDiversity()` - Outfit completeness (5-10)
- `generateExplanation()` - Human-readable reasoning

### Router: recommendationRouter

**File:** `server/api/routers/recommendations.ts`

Three tRPC endpoints for type-safe API access.

#### `recommendations.generate` (Query)

Generates outfit recommendations.

**Input:**

```typescript
{
  userId: string              // Required
  mood?: Mood                 // Optional
  weather?: WeatherCondition  // Optional
  temperature?: number        // Optional: -50 to 50°C
  occasion?: string           // Optional
  limitCount?: number         // Optional: 1-10, default 5
}
```

**Output:**

```typescript
{
  outfits: Outfit[]           // Generated outfits
  explanation: string         // Context explanation
  totalGenerated: number      // Count of returned outfits
}
```

#### `recommendations.getOutfit` (Query)

Retrieves single outfit with full garment details.

#### `recommendations.logInteraction` (Mutation)

Logs user interactions (shown, saved, skipped, worn) for analytics.

### React Hook: useOutfitRecommendations

**File:** `apps/web/hooks/use-outfit-recommendations.ts`

Manages state and triggers API calls.

**State:**

```typescript
{
  outfits: Outfit[]       // Generated recommendations
  loading: boolean        // API call in progress
  error: string | null    // Error message if any
  explanation: string     // Overall context
}
```

**Methods:**

```typescript
generate(options): Promise<void>  // Trigger generation
reset(): void                     // Clear results
```

### React Component: OutfitRecommendationPanel

**File:** `apps/web/components/outfit-recommendation-panel.tsx`

Complete UI with:

- Mood dropdown (7 options)
- Weather selector (7 options)
- Temperature slider (-20°C to +40°C)
- Outfit grid display
- Score visualization
- Error handling
- Loading states

## Data Models

### Garment

```typescript
interface Garment {
  id: string; // Unique identifier
  userId: string; // Owner
  name: string; // Display name
  category: GarmentCategory; // tops|bottoms|shoes|outerwear|accessories
  primaryColor: string; // Main color
  secondaryColor?: string; // Optional secondary
  material?: string; // cotton|wool|silk|linen|synthetic
  season: Season; // spring|summer|fall|winter|all-season
  imageUrl?: string; // Photo URL
  tags: string[]; // Tags: casual, formal, bold, etc.
  createdAt: Date; // Creation timestamp
}
```

### Outfit

```typescript
interface Outfit {
  id: string; // Unique identifier
  userId: string; // Owner
  garmentIds: string[]; // Garment IDs in outfit
  contextWeather?: WeatherCondition;
  contextMood?: Mood;
  explanation: string; // Why these pieces match
  score: number; // 0-100 quality score
  createdAt: Date;
}
```

### Enums

**Mood:**

- casual: Relaxed, everyday wear
- formal: Professional, structured
- adventurous: Bold, expressive
- cozy: Warm, comfortable
- energetic: Bright, dynamic
- minimalist: Simple, clean
- bold: Eye-catching, statement

**WeatherCondition:**

- sunny, cloudy, rainy, snowy, windy, hot, cold

**Season:**

- spring, summer, fall, winter, all-season

**GarmentCategory:**

- tops, bottoms, shoes, outerwear, accessories

## Algorithm Details

### Filtering Phase

**Season Matching:**

- Summer → sunny, cloudy, hot, all-season
- Winter → rainy, snowy, cold, all-season
- Spring/Fall → cloudy, windy, all-season

**Temperature Thresholds:**

- Hot (>25°C): Exclude wool, fleece, heavy outerwear
- Cold (<10°C): Prefer wool, fleece, down materials
- Mild (10-25°C): All materials acceptable

### Scoring

**Color Harmony:**

- Complementary pairs (Blue/Orange, Red/Green, Yellow/Purple): +15
- Monochromatic (all same color): +10
- Neutral safe (≥2 neutrals): +8

**Mood Alignment:**

- Maps mood to tags (e.g., casual → cotton, denim, relaxed)
- +3 points per matching tag per garment

**Diversity:**

- 3+ pieces: +10 points
- Fewer pieces: +5 points

**Base Score:** 50 points (all outfits start here)

### Explanation Generation

Examples:

- "Well-balanced outfit with 4 pieces • Neutral base for easy coordination • Perfect for a relaxed day"
- "Polished and professional look with 3 pieces"
- "Energizing and uplifting outfit with complementary colors"

## API Examples

### Casual Outfit

```typescript
await trpc.recommendations.generate.query({
  userId: "user123",
  mood: "casual",
  limitCount: 3,
});
```

### Weather-Specific

```typescript
await trpc.recommendations.generate.query({
  userId: "user123",
  weather: "rainy",
  temperature: 10,
  mood: "cozy",
});
```

### Formal Event

```typescript
await trpc.recommendations.generate.query({
  userId: "user123",
  mood: "formal",
  occasion: "business meeting",
});
```

## Integration

### Database

Replace mock data with real queries:

```typescript
const garments = await db.garment.findMany({
  where: { userId: input.userId },
});
```

**Prisma Schema:**

```prisma
model Garment {
  id              String   @id @default(cuid())
  userId          String
  name            String
  category        String
  primaryColor    String
  secondaryColor  String?
  material        String?
  season          String
  imageUrl        String?
  tags            String   @default("[]")
  createdAt       DateTime @default(now())

  @@index([userId])
}
```

### Weather API

Integrate real-time weather:

```typescript
const weather = await getWeatherData(userLocation);
const recommendations = await generateOutfits(garments, {
  weather: weather.condition,
  temperature: weather.temperature,
});
```

### Images

Store in S3/R2 with CDN:

- Original: Full resolution
- Thumbnail: CDN-cached
- Processed: Color-tagged for analysis

### Learning Pipeline

Track interactions for future improvements:

- Saved/worn outfits
- Color combination success rates
- Seasonal patterns
- User preferences

## Customization

### Add New Mood

Edit `shared/types/index.ts`:

```typescript
export type Mood = "casual" | "formal" | "your-new-mood";
```

Update `outfitRecommendationService.ts`:

```typescript
const moodTags: Record<Mood, string[]> = {
  "your-new-mood": ["tag1", "tag2", "tag3"],
};
```

### Adjust Scoring Weights

Edit methods in `outfitRecommendationService.ts`:

```typescript
// Increase color importance
harmonyScore += 25; // Was 15

// Increase mood matching
score += matches * 5; // Was 3

// Increase diversity preference
return garments.length >= 3 ? 20 : 5; // Was 10/5
```

### Add Weather Type

Edit `shared/types/index.ts`:

```typescript
export type WeatherCondition = "sunny" | "cloudy" | "your-weather";
```

Update `outfitRecommendationService.ts`:

```typescript
const weatherSeasonMap: Record<WeatherCondition, string[]> = {
  "your-weather": ["spring", "fall", "all-season"],
};
```

**Mock Data:** 8 sample garments included in `recommendations.ts`

- Variety of categories, colors, materials, seasons

## Features

✅ **Smart Algorithm** - 3-stage pipeline
✅ **Explainable** - Human-readable scoring
✅ **Context-Aware** - Mood + weather + temperature
✅ **Type-Safe** - Full TypeScript + Zod
✅ **Mock Data** - Ready for testing
✅ **Well-Documented** - Comprehensive docs
✅ **Easy Integration** - Clear paths for DB/API/images
✅ **Extensible** - Ready for customization
