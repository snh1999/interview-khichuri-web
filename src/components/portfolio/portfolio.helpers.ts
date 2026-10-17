import { cloneAssetImage } from "@/lib/storage/imageStorageDb";
import { generateSafeId } from "@/lib/utils";
import type {
  CanvasElement,
  FrameElement,
  ImageElement,
  MoodboardItem,
  Portfolio,
  ThemeConfig,
} from "./sketch/types";
import {
  applyProfileTokens,
  createInitialPortfolio,
  DEFAULT_THEMES,
  remapElementIds,
  type TProfileTokens,
} from "./sketch/utils/defaultPortfolios";

/**
 * Pure domain builders for portfolio records, extracted from the editor store's
 * former CRUD so the react-query hooks can own create/duplicate/import.
 */

export interface IBuildNewPortfolioInput {
  title?: string;
  description?: string;
  template?: boolean;
  profile?: Partial<TProfileTokens>;
}

export const buildNewPortfolio = (
  input: IBuildNewPortfolioInput = {}
): Portfolio => {
  const now = new Date().toISOString();
  const base = createInitialPortfolio();
  const seedElements: CanvasElement[] = input.template
    ? applyProfileTokens(remapElementIds(base.elements), input.profile)
    : [];

  return {
    id: generateSafeId(),
    title: input.title ?? "Untitled Portfolio",
    description: input.description ?? "",
    createdAt: now,
    updatedAt: now,
    elements: seedElements,
    moodboard: [],
    theme: input.template ? base.theme : DEFAULT_THEMES[0],
    generatedDesigns: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };
};

export const buildDuplicatedPortfolio = async (
  target: Portfolio
): Promise<Portfolio> => {
  const clonedTarget = structuredClone(target);
  const newPortfolioId = generateSafeId();
  const cloneTasks: Promise<void>[] = [];

  const remappedElements = remapElementIds(clonedTarget.elements).map(
    (clonedEl) => {
      // Clone IDB assets so each portfolio owns independent image blobs
      if (clonedEl.type === "image") {
        const img = clonedEl as ImageElement;
        // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
        if (img.src?.startsWith("idb://")) {
          const oldAssetId = img.src.replace("idb://", "");
          const newAssetId = generateSafeId();
          cloneTasks.push(
            cloneAssetImage(oldAssetId, newAssetId).then((success) => {
              if (success) {
                img.src = `idb://${newAssetId}`;
              } else {
                console.warn(
                  `[portfolio.helpers/duplicate] Failed to clone image asset ${oldAssetId}`
                );
              }
            })
          );
        }
      } else if (clonedEl.type === "frame") {
        const frame = clonedEl as FrameElement;
        if (frame.inspirationImageUrl?.startsWith("idb://")) {
          const oldAssetId = frame.inspirationImageUrl.replace("idb://", "");
          const newAssetId = generateSafeId();
          cloneTasks.push(
            cloneAssetImage(oldAssetId, newAssetId).then((success) => {
              if (success) {
                frame.inspirationImageUrl = `idb://${newAssetId}`;
              } else {
                console.warn(
                  `[portfolio.helpers/duplicate] Failed to clone inspiration asset ${oldAssetId}`
                );
              }
            })
          );
        }
      }

      return clonedEl;
    }
  );

  const remappedMoodboard = (clonedTarget.moodboard || []).map((item) => {
    if (item.url?.startsWith("idb://")) {
      const oldAssetId = item.url.replace("idb://", "");
      const newAssetId = generateSafeId();
      cloneTasks.push(
        cloneAssetImage(oldAssetId, newAssetId).then((success) => {
          if (success) {
            item.id = newAssetId;
            item.url = `idb://${newAssetId}`;
          } else {
            console.warn(
              `[portfolio.helpers/duplicate] Failed to clone moodboard asset ${oldAssetId}`
            );
          }
        })
      );
      return item;
    }
    return { ...item, id: generateSafeId("mood") };
  });

  // Await all asset clones before committing so no dead idb:// references land
  await Promise.all(cloneTasks);

  return {
    ...clonedTarget,
    id: newPortfolioId,
    title: `${target.title} (Copy)`,
    elements: remappedElements,
    moodboard: remappedMoodboard,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const normalizeImportedPortfolio = (
  imported: unknown,
  baseTheme: ThemeConfig,
  existing = false
): Portfolio | null => {
  if (!imported || typeof imported !== "object") {
    return null;
  }
  const incoming = imported as Partial<Portfolio>;

  const validTypes = new Set([
    "frame",
    "rectangle",
    "ellipse",
    "line",
    "arrow",
    "text",
    "stamp",
    "pen",
    "image",
  ]);
  const validElements = Array.isArray(incoming.elements)
    ? incoming.elements.filter((el): el is CanvasElement =>
        Boolean(
          el &&
            typeof el === "object" &&
            typeof el.id === "string" &&
            typeof el.type === "string" &&
            validTypes.has(el.type) &&
            typeof el.x === "number" &&
            !Number.isNaN(el.x) &&
            typeof el.y === "number" &&
            !Number.isNaN(el.y)
        )
      )
    : [];

  // Normalize moodboard items thoroughly so missing fields never crash views
  const normalizedMoodboard = Array.isArray(incoming.moodboard)
    ? incoming.moodboard.map((m) => ({
        id: m.id || generateSafeId("mood"),
        url: m.url || "",
        name: m.name || "Moodboard Item",
        dominantColors:
          Array.isArray(m.dominantColors) && m.dominantColors.length > 0
            ? m.dominantColors
            : ["#6366f1", "#06b6d4"],
        tags: Array.isArray(m.tags) ? m.tags : [],
        notes: m.notes || "",
        uploadedAt: m.uploadedAt || new Date().toISOString(),
      }))
    : [];

  const safeThemeKeys = [
    "id",
    "name",
    "primaryColor",
    "secondaryColor",
    "accentColor",
    "backgroundColor",
    "surfaceColor",
    "textColor",
    "textMutedColor",
    "fontHeading",
    "fontBody",
    "borderRadius",
    "styleMood",
  ];
  const safeThemeOverride =
    incoming.theme && typeof incoming.theme === "object"
      ? Object.fromEntries(
          Object.entries(incoming.theme).filter(
            ([k, v]) => safeThemeKeys.includes(k) && typeof v === "string"
          )
        )
      : {};

  return {
    id: existing || !incoming.id ? generateSafeId() : incoming.id,
    title: existing
      ? `${incoming.title || "Portfolio"} (Imported)`
      : incoming.title || "Imported Portfolio",
    description: incoming.description || "",
    elements: validElements,
    theme: { ...baseTheme, ...safeThemeOverride },
    moodboard: normalizedMoodboard,
    generatedDesigns: Array.isArray(incoming.generatedDesigns)
      ? incoming.generatedDesigns
      : [],
    viewport:
      incoming.viewport && typeof incoming.viewport.zoom === "number"
        ? incoming.viewport
        : { x: 0, y: 0, zoom: 1 },
    createdAt: incoming.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export function extractAllValidAssetIds(
  portfolios: Portfolio[],
  clipboard?: CanvasElement[],
  history?: {
    past: { elements: CanvasElement[]; moodboard?: MoodboardItem[] }[];
    future: { elements: CanvasElement[]; moodboard?: MoodboardItem[] }[];
  }
): Set<string> {
  const validIds = new Set<string>();

  const processElements = (elements?: CanvasElement[]) => {
    for (const el of elements ?? []) {
      if (el.type === "image") {
        const img = el as ImageElement;
        // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
        if (img.src?.startsWith("idb://")) {
          validIds.add(img.src.replace("idb://", ""));
        }
      } else if (el.type === "frame") {
        const frame = el as FrameElement;
        if (frame.inspirationImageUrl?.startsWith("idb://")) {
          validIds.add(frame.inspirationImageUrl.replace("idb://", ""));
        }
      }
    }
  };

  const processMoodboard = (moodboard?: MoodboardItem[]) => {
    for (const m of moodboard ?? []) {
      if (m.id) {
        validIds.add(m.id);
      }
      if (m.url?.startsWith("idb://")) {
        validIds.add(m.url.replace("idb://", ""));
      }
    }
  };

  for (const p of portfolios) {
    processMoodboard(p.moodboard);
    processElements(p.elements);
  }

  if (clipboard) {
    processElements(clipboard);
  }

  if (history) {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
    for (const snap of history.past ?? []) {
      processElements(snap.elements);
      processMoodboard(snap.moodboard);
    }
    // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
    for (const snap of history.future ?? []) {
      processElements(snap.elements);
      processMoodboard(snap.moodboard);
    }
  }

  return validIds;
}
