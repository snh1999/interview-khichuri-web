export type ToolType =
  | "select"
  | "hand"
  | "frame"
  | "pen"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "stamp"
  | "eraser";

export type StampType =
  | "button"
  | "input"
  | "card"
  | "navbar"
  | "hero"
  | "avatar"
  | "image"
  | "badge"
  | "table"
  | "sidebar"
  | "stats"
  | "project"
  | "skills"
  | "experience"
  | "testimonial"
  | "contact";

export interface Point {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
  opacity?: number;
  roughness?: number;
  cornerRadius?: number;
  frameId?: string;
  locked?: boolean;
  visible?: boolean;
  name?: string;
  zIndex: number;
}

export interface ShapeElement extends BaseElement {
  type: "rectangle" | "ellipse";
}

export interface PenElement extends BaseElement {
  type: "pen";
  points: Point[];
}

export interface LineElement extends BaseElement {
  type: "line" | "arrow";
  endX?: number;
  endY?: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold" | "500" | "600";
  textAlign?: "left" | "center" | "right";
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt?: string;
  caption?: string;
  isInspiration?: boolean;
}

export interface FrameElement extends BaseElement {
  type: "frame";
  title: string;
  route?: string;
  description?: string;
  isHome?: boolean;
  parentPageId?: string;
  inspirationImageUrl?: string;
  preset: "desktop" | "mobile" | "tablet" | "card" | "custom";
  background?: string;
}

export interface StampElement extends BaseElement {
  type: "stamp";
  stampType: StampType;
  label?: string;
  sublabel?: string;
  variant?: string;
  isSharedMaster?: boolean;
  isGlobalShared?: boolean;
}

export type CanvasElement =
  | ShapeElement
  | PenElement
  | LineElement
  | TextElement
  | ImageElement
  | FrameElement
  | StampElement;

export type ElementChanges = Partial<{
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  opacity: number;
  roughness: number;
  cornerRadius: number;
  frameId: string;
  locked: boolean;
  visible: boolean;
  name: string;
  zIndex: number;
  points: Point[];
  endX: number;
  endY: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold" | "500" | "600";
  textAlign: "left" | "center" | "right";
  src: string;
  alt: string;
  caption: string;
  isInspiration: boolean;
  title: string;
  route: string;
  description: string;
  isHome: boolean;
  parentPageId: string;
  inspirationImageUrl: string;
  preset: "desktop" | "mobile" | "tablet" | "card" | "custom";
  background: string;
  stampType: StampType;
  label: string;
  sublabel: string;
  variant: string;
  isSharedMaster: boolean;
  isGlobalShared: boolean;
}>;

export interface MoodboardItem {
  id: string;
  url: string;
  name: string;
  dominantColors: string[];
  tags: string[];
  notes?: string;
  uploadedAt?: string;
}

/**
 * Theme & Color Architecture Decision:
 *
 * 1. App UI Shell (Sidebars, Navbars, Modals, Menus):
 *    - MUST use CSS Variables and Tailwind semantic tokens (`bg-card`, `text-foreground`, `border-border`, `text-primary`).
 *    - Adapts automatically to user's system light/dark theme preference.
 *
 * 2. Canvas Elements & Generated / Exported Portfolios:
 *    - Store concrete hex/rgb CSS color values (`#6366f1`, `#090d16`, etc.) in `ThemeConfig` and `CanvasElement`.
 *    - Exported portfolios are standalone applications that require fixed, designed palettes independent of the builder's theme.
 */
export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMutedColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "full";
  styleMood: "modern" | "minimal" | "brutalist" | "luxury" | "playful";
}

export interface GeneratedDesign {
  id: string;
  /** Page routes this design covers, e.g. ["/", "/about"]. */
  routes: string[];
  createdAt: string;
  prompt?: string;
  themeUsed: ThemeConfig;
  wireframeSummary: {
    elementCount: number;
    detectedLayout: string;
    sections: string[];
  };
  /** Path-keyed file map: "/App.js" (router) + one file per route + "/styles.css". */
  files: Record<string, string>;
  previewType: "interactive" | "code" | "side-by-side";
}

export interface Portfolio {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  elements: CanvasElement[];
  moodboard: MoodboardItem[];
  theme: ThemeConfig;
  generatedDesigns: GeneratedDesign[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

export type ViewMode = "canvas" | "moodboard" | "preview";
