import { ImageAnnotatorClient } from "@google-cloud/vision";

/** Result of analyzing a garment image — maps to add-garment form fields */
export interface GarmentImageAnalysis {
  category: "top" | "bottom" | "shoes" | "outerwear" | "accessory";
  color: string;
  tags: string[];
  style: string[];
  fit: string;
  occasion: string[];
  versatility: "high" | "medium" | "low";
  vibrancy: "muted" | "balanced" | "vibrant";
  nameSuggestion?: string;
}

const OUR_COLORS = [
  "Black",
  "White",
  "Grey",
  "Navy",
  "Brown",
  "Cream",
  "Indigo",
  "Olive",
  "Red",
  "Blue",
  "Green",
  "Beige",
  "Pink",
  "Yellow",
] as const;

/** Approximate RGB for each named color (for matching Vision dominant color) */
const COLOR_RGB: Record<string, [number, number, number]> = {
  Black: [0, 0, 0],
  White: [255, 255, 255],
  Grey: [128, 128, 128],
  Navy: [0, 0, 128],
  Brown: [139, 69, 19],
  Cream: [255, 253, 208],
  Indigo: [75, 0, 130],
  // Bias olive toward greener / yellower and farther from dark navy
  Olive: [110, 120, 40],
  Red: [220, 20, 60],
  Blue: [30, 144, 255],
  Green: [34, 139, 34],
  Beige: [245, 245, 220],
  Pink: [255, 192, 203],
  Yellow: [255, 255, 0],
};

/** Label keywords -> our category */
const LABEL_TO_CATEGORY: Record<
  string,
  "top" | "bottom" | "shoes" | "outerwear" | "accessory"
> = {
  // tops
  shirt: "top",
  "t-shirt": "top",
  "t shirt": "top",
  blouse: "top",
  top: "top",
  sweater: "top",
  jersey: "top",
  hoodie: "top",
  sweatshirt: "top",
  tank: "top",
  vest: "top",
  polo: "top",
  // bottoms
  pants: "bottom",
  trousers: "bottom",
  jeans: "bottom",
  shorts: "bottom",
  skirt: "bottom",
  leggings: "bottom",
  chinos: "bottom",
  // shoes
  shoe: "shoes",
  shoes: "shoes",
  sneakers: "shoes",
  boot: "shoes",
  boots: "shoes",
  sandal: "shoes",
  sandals: "shoes",
  loafers: "shoes",
  heels: "shoes",
  footwear: "shoes",
  // outerwear
  jacket: "outerwear",
  coat: "outerwear",
  blazer: "outerwear",
  parka: "outerwear",
  "rain coat": "outerwear",
  raincoat: "outerwear",
  cardigan: "outerwear",
  // accessory
  bag: "accessory",
  hat: "accessory",
  cap: "accessory",
  scarf: "accessory",
  belt: "accessory",
  tie: "accessory",
  sunglasses: "accessory",
  watch: "accessory",
  jewelry: "accessory",
  accessory: "accessory",
};

/** Labels that suggest occasion */
const LABEL_TO_OCCASION: Record<string, string> = {
  formal: "formal",
  casual: "casual",
  sportswear: "casual",
  athletic: "casual",
  business: "work",
  professional: "work",
  party: "night",
  evening: "night",
  weekend: "weekend",
  "smart casual": "smart-casual",
};

/** Labels that suggest style */
const LABEL_TO_STYLE: Record<string, string> = {
  classic: "classic",
  minimalist: "minimalist",
  bold: "bold",
  trendy: "trendy",
  casual: "casual",
  vintage: "classic",
  modern: "trendy",
};

function nearestColor(
  r: number,
  g: number,
  b: number
): (typeof OUR_COLORS)[number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const avg = (r + g + b) / 3;

  // Neutral heuristic: if channels are very close to each other, treat as grayscale
  if (max - min <= 20) {
    if (avg >= 210) return "White";
    if (avg <= 60) return "Black";
    return "Grey";
  }

  let best: (typeof OUR_COLORS)[number] = OUR_COLORS[0];
  let bestDist = Infinity;
  for (const name of OUR_COLORS) {
    const [cr, cg, cb] = COLOR_RGB[name] ?? [128, 128, 128];
    const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = name;
    }
  }
  return best;
}

function inferCategory(
  labels: string[]
): "top" | "bottom" | "shoes" | "outerwear" | "accessory" {
  const lower = labels.map((l) => l.toLowerCase().trim());
  for (const label of lower) {
    const key = label.replace(/\s+/g, " ");
    if (LABEL_TO_CATEGORY[key]) return LABEL_TO_CATEGORY[key];
    // partial match
    for (const [kw, cat] of Object.entries(LABEL_TO_CATEGORY)) {
      if (label.includes(kw) || kw.includes(label)) return cat;
    }
  }
  return "top";
}

function inferOccasions(labels: string[]): string[] {
  const out = new Set<string>();
  const lower = labels.map((l) => l.toLowerCase().trim());
  for (const label of lower) {
    for (const [kw, occ] of Object.entries(LABEL_TO_OCCASION)) {
      if (label.includes(kw) || label.includes(occ)) out.add(occ);
    }
  }
  return [...out];
}

function inferStyles(labels: string[]): string[] {
  const out = new Set<string>();
  const lower = labels.map((l) => l.toLowerCase().trim());
  for (const label of lower) {
    for (const [kw, style] of Object.entries(LABEL_TO_STYLE)) {
      if (label.includes(kw) || label.includes(style)) out.add(style);
    }
  }
  return [...out];
}

function buildTags(labels: string[]): string[] {
  const skip = new Set([
    "clothing",
    "apparel",
    "garment",
    "fashion",
    "textile",
    "sleeve",
    "pattern",
    "font",
  ]);
  const normalized = labels
    .map((l) => l.toLowerCase().trim().replace(/\s+/g, "-"))
    .filter((t) => t.length > 1 && t.length < 25 && !skip.has(t));
  return [...new Set(normalized)].slice(0, 8);
}

function createVisionClient(): ImageAnnotatorClient {
  const json = process.env.GOOGLE_CLOUD_VISION_CREDENTIALS_JSON;
  if (json) {
    try {
      const parsed = JSON.parse(json) as {
        client_email?: string;
        private_key?: string;
        project_id?: string;
      };
      if (parsed.client_email && parsed.private_key) {
        return new ImageAnnotatorClient({
          credentials: {
            client_email: parsed.client_email,
            private_key: parsed.private_key,
          },
          projectId: parsed.project_id,
        });
      }
    } catch {
      // fall back to Application Default Credentials
    }
  }
  return new ImageAnnotatorClient();
}

/** Vision API feature types */
const FEATURE_LABEL = "LABEL_DETECTION" as const;
const FEATURE_IMAGE_PROPERTIES = "IMAGE_PROPERTIES" as const;

async function analyzeGarmentImageInternal(
  imageBase64: string
): Promise<GarmentImageAnalysis> {
  const raw = imageBase64.startsWith("data:")
    ? imageBase64.split(",")[1]
    : imageBase64;
  if (!raw?.trim()) throw new Error("Invalid image data");

  const client = createVisionClient();
  // Vision API expects base64-encoded text per https://cloud.google.com/vision/docs/base64
  const [batchResponse] = await client.batchAnnotateImages({
    requests: [
      {
        image: { content: raw },
        features: [
          { type: FEATURE_LABEL, maxResults: 20 },
          { type: FEATURE_IMAGE_PROPERTIES },
        ],
      },
    ],
  });

  const first = batchResponse?.responses?.[0];
  if (!first) throw new Error("No response from Vision API");

  const apiError = (first as { error?: { message?: string; code?: number } })
    .error;
  if (apiError) {
    const msg = apiError.message ?? "Vision API error";
    const code = apiError.code;
    if (code === 16)
      throw new Error(
        "Image could not be processed. Use a clear photo of a single garment."
      );
    if (code === 7)
      throw new Error(
        "Permission denied. Check GOOGLE_APPLICATION_CREDENTIALS and Vision API is enabled."
      );
    throw new Error(msg);
  }

  const labelAnnotations = (first.labelAnnotations ?? []) as Array<{
    description?: string;
  }>;
  const labels: string[] = labelAnnotations
    .map((a) => a.description ?? "")
    .filter(Boolean);

  let colorName: (typeof OUR_COLORS)[number] = OUR_COLORS[0];
  let mainR: number | undefined;
  let mainG: number | undefined;
  let mainB: number | undefined;
  const props = first.imagePropertiesAnnotation as
    | {
        dominantColors?: {
          colors?: Array<{
            color?: { red?: number; green?: number; blue?: number };
          }>;
        };
      }
    | undefined;
  const colorInfo = props?.dominantColors?.colors;
  if (colorInfo?.length) {
    const top = colorInfo[0];
    // Vision API may return 0–1 or 0–255; normalize to 0–255
    const rawR = top.color?.red ?? 0;
    const rawG = top.color?.green ?? 0;
    const rawB = top.color?.blue ?? 0;
    const usesUnitScale = rawR <= 1 && rawG <= 1 && rawB <= 1;
    const r = Math.round(usesUnitScale ? rawR * 255 : rawR);
    const g = Math.round(usesUnitScale ? rawG * 255 : rawG);
    const b = Math.round(usesUnitScale ? rawB * 255 : rawB);
    mainR = r;
    mainG = g;
    mainB = b;
    colorName = nearestColor(r, g, b);
  }
  if (colorName === OUR_COLORS[0] && labels.length > 0) {
    // try to infer color from labels (e.g. "blue shirt")
    const colorLabels = [
      "black",
      "white",
      "grey",
      "gray",
      "navy",
      "brown",
      "cream",
      "indigo",
      "olive",
      "red",
      "blue",
      "green",
      "beige",
      "pink",
      "yellow",
    ];
    for (const l of labels.map((x) => x.toLowerCase())) {
      for (const c of colorLabels) {
        if (l.includes(c)) {
          colorName = (
            c === "gray"
              ? "Grey"
              : ((c.charAt(0).toUpperCase() + c.slice(1)) as string)
          ) as (typeof OUR_COLORS)[number];
          break;
        }
      }
    }
  }

  const category = inferCategory(labels);
  let occasion = inferOccasions(labels);
  let style = inferStyles(labels);
  const tags = buildTags(labels);

  // Derive vibrancy and versatility from color characteristics
  let vibrancy: "muted" | "balanced" | "vibrant";
  let versatility: "high" | "medium" | "low";
  const neutralColors = new Set<GarmentImageAnalysis["color"]>([
    "Black",
    "White",
    "Grey",
    "Navy",
    "Brown",
    "Cream",
    "Beige",
  ]);

  if (mainR !== undefined && mainG !== undefined && mainB !== undefined) {
    const max = Math.max(mainR, mainG, mainB);
    const min = Math.min(mainR, mainG, mainB);
    const avg = (mainR + mainG + mainB) / 3;
    const chroma = max - min;

    if (chroma <= 20) {
      vibrancy = "muted";
      versatility = "high";
      if (style.length === 0) {
        style = ["minimalist", "classic"];
      }
    } else if (chroma >= 80 && avg >= 80 && avg <= 240) {
      vibrancy = "vibrant";
      versatility = neutralColors.has(colorName) ? "medium" : "low";
      if (style.length === 0) {
        style = ["bold", "trendy"];
      }
    } else {
      vibrancy = "balanced";
      versatility = neutralColors.has(colorName) ? "high" : "medium";
      if (style.length === 0) {
        style = ["casual"];
      }
    }

    if (occasion.length === 0) {
      if (vibrancy === "vibrant") {
        occasion = ["casual", "weekend", "night"];
      } else if (neutralColors.has(colorName)) {
        occasion = ["casual", "work"];
      } else {
        occasion = ["casual"];
      }
    }
  } else {
    if (style.length === 0) style = ["casual"];
    if (occasion.length === 0) occasion = ["casual"];
    vibrancy = "balanced";
    versatility = "medium";
  }

  const nameParts: string[] = [];
  if (colorName) nameParts.push(colorName);
  const firstLabel = labels[0];
  if (firstLabel) nameParts.push(firstLabel);
  const nameSuggestion = nameParts.length ? nameParts.join(" ") : undefined;
  const analysis: GarmentImageAnalysis = {
    category,
    color: colorName,
    tags,
    style: style.length ? style : ["casual"],
    fit: "relaxed",
    occasion: occasion.length ? occasion : ["casual"],
    versatility,
    vibrancy,
    nameSuggestion,
  };

  return analysis;
}

export async function analyzeGarmentImage(
  imageBase64: string
): Promise<GarmentImageAnalysis> {
  return analyzeGarmentImageInternal(imageBase64);
}
