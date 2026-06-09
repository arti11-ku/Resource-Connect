export type ReviewCategory = "blood" | "tree" | "food" | "other";

export interface ReviewImage {
  id: number;
  src: string;
  name: string;
  label: string;
  category: ReviewCategory;
  uploadedAt: string;
}

const STORAGE_KEY = "sahara_smart_review_images";
const EVENT_NAME = "sahara:smart-review-updated";

export function loadReviewImages(): ReviewImage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReviewImages(images: ReviewImage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // Ignore storage errors (quota / private mode)
  }
}

export function subscribeToReviewImages(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

const CATEGORY_KEYWORDS: Record<Exclude<ReviewCategory, "other">, string[]> = {
  blood: ["blood", "donation", "donor", "transfusion", "plasma"],
  tree: ["tree", "plant", "plantation", "sapling", "green", "forest"],
  food: ["food", "meal", "feed", "ration", "grain", "kitchen", "hunger", "distribution"],
};

export function classifyImage(label: string, fileName: string): ReviewCategory {
  const text = `${label} ${fileName}`.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Exclude<ReviewCategory, "other">, string[]][]) {
    if (keywords.some(k => text.includes(k))) return cat;
  }
  return "other";
}

export function pickImageForCategory(images: ReviewImage[], cat: ReviewCategory): ReviewImage | null {
  const matches = images.filter(i => i.category === cat);
  if (matches.length > 0) return matches[0];
  // Fallback: any image
  return images[0] ?? null;
}
