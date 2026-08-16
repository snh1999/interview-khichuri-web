import {
  Document as PdfDocument,
  Link as PdfLink,
  Page as PdfPage,
  Text as PdfText,
  View as PdfView,
} from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  registerPdfFonts,
  type TFontFamily,
} from "@/components/resume/font.ts";

registerPdfFonts();

export type RenderMode = "pdf" | "web";

const RenderModeContext = createContext<RenderMode>("pdf");
export const useRenderMode = () => useContext(RenderModeContext);

// A4 in points (matches react-pdf's own unit system)
export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;
const PT_TO_PX = 4.0 / 3;

export interface PdfSettings {
  fontSize: number;
  fontFamily: TFontFamily;
  lineHeight: number;
  padding: number;
}

export const DEFAULT_PDF_SETTINGS: PdfSettings = {
  fontSize: 11,
  fontFamily: "Inter",
  lineHeight: 1.1,
  padding: 57.6,
};

const SettingsContext = createContext<PdfSettings>(DEFAULT_PDF_SETTINGS);
export const usePdfSettings = () => useContext(SettingsContext);

export function RenderProvider({
  mode,
  settings,
  children,
}: {
  mode: RenderMode;
  settings?: Partial<PdfSettings>;
  children: ReactNode;
}) {
  const merged = useMemo(
    () => ({ ...DEFAULT_PDF_SETTINGS, ...settings }),
    [settings]
  );
  return (
    <RenderModeContext.Provider value={mode}>
      <SettingsContext.Provider value={merged}>
        {children}
      </SettingsContext.Provider>
    </RenderModeContext.Provider>
  );
}

const SIZE_KEYS = new Set([
  "fontSize",
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  "padding",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "margin",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "borderWidth",
  "borderTopWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRightWidth",
  "borderRadius",
  "gap",
]);

function toWebStyle(style?: StyleProp): CSSProperties {
  if (!style) {
    return {};
  }
  const flat = Array.isArray(style) ? Object.assign({}, ...style) : style;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (typeof value === "number" && SIZE_KEYS.has(key)) {
      out[key] = `${value * PT_TO_PX}px`;
    } else {
      out[key] = value;
    }
  }
  return out;
}

// StyleSheet.create is a no-op passthrough — works identically for both
export const StyleSheet = { create: <T,>(s: T): T => s };

export type StyleProp = Style | Style[];

interface CommonProps {
  style?: StyleProp;
  children?: ReactNode;
  key?: string | number;
}

export interface ViewProps extends CommonProps {
  wrap?: boolean;
  break?: boolean;
  fixed?: boolean;
}

export interface TextProps extends CommonProps {
  fixed?: boolean;
  break?: boolean;
}

export interface LinkProps extends CommonProps {
  src: string;
}

export interface PageProps extends CommonProps {
  wrap?: boolean;
}

export function View({ style, children, ...rest }: ViewProps) {
  const mode = useRenderMode();
  if (mode === "pdf") {
    return (
      <PdfView style={style} {...rest}>
        {children}
      </PdfView>
    );
  }
  return (
    <div
      style={{ display: "flex", flexDirection: "column", ...toWebStyle(style) }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Text({ style, children, ...rest }: TextProps) {
  const mode = useRenderMode();
  if (mode === "pdf") {
    return (
      <PdfText style={style} {...rest}>
        {children}
      </PdfText>
    );
  }
  const webStyle = toWebStyle(style);
  const hasVerticalMargins =
    webStyle.marginBottom !== undefined || webStyle.marginTop !== undefined;
  const display = webStyle.display ?? (hasVerticalMargins ? "block" : "inline");

  return (
    <span style={{ display, ...webStyle }} {...rest}>
      {children}
    </span>
  );
}

export function Link({ style, src, children, ...rest }: LinkProps) {
  const mode = useRenderMode();
  if (mode === "pdf") {
    return (
      <PdfLink src={src} style={style} {...rest}>
        {children}
      </PdfLink>
    );
  }
  return (
    <a href={src} style={toWebStyle(style)} {...rest}>
      {children}
    </a>
  );
}

export function Page({ style, children, ...rest }: PageProps) {
  const mode = useRenderMode();
  const settings = usePdfSettings();
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  const fullPageHeightPx = A4_HEIGHT_PT * PT_TO_PX;
  const paddingPx = settings.padding * PT_TO_PX;
  const usableHeightPx = (A4_HEIGHT_PT - settings.padding * 2) * PT_TO_PX;

  useEffect(() => {
    if (mode !== "web" || !contentRef.current) {
      return;
    }
    const el = contentRef.current;
    let rafId: number | null = null;
    const measure = () => {
      const paddingTotalPx = paddingPx * 2;
      const rawContentPx = Math.max(0, el.scrollHeight - paddingTotalPx);
      const next = Math.max(1, Math.ceil(rawContentPx / usableHeightPx));
      setPageCount((prev) => (prev === next ? prev : next));
    };
    const onResize = () => {
      if (rafId !== null) {
        return;
      }
      rafId = requestAnimationFrame(() => {
        rafId = null;
        measure();
      });
    };
    measure();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [mode, paddingPx, usableHeightPx]);

  if (mode === "pdf") {
    return (
      <PdfPage size="A4" style={style} {...rest}>
        {children}
      </PdfPage>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: `${A4_WIDTH_PT * PT_TO_PX}px`,
        margin: "0 auto",
        background: "#fff",
        boxShadow: "0 0 0 1px #ddd",
        fontFamily: settings.fontFamily,
        minHeight: `${fullPageHeightPx * pageCount}px`,
      }}
    >
      <div
        ref={contentRef}
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: `${fullPageHeightPx}px`,
          ...toWebStyle(style),
        }}
      >
        {children}
      </div>
      {Array.from({ length: pageCount - 1 }).map((_, i) => (
        <div
          key={i.toString()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${paddingPx + (i + 1) * usableHeightPx}px`,
            borderTop: "2px dashed #999",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "#999",
              background: "#fff",
              padding: "0 4px",
              transform: "translateY(-50%)",
              textAlign: "center",
            }}
          >
            page {i + 2}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Document({ children }: { children: ReactNode }) {
  const mode = useRenderMode();
  if (mode === "pdf") {
    return <PdfDocument>{children}</PdfDocument>;
  }
  return <>{children}</>;
}
