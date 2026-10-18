import { useEffect, useState } from "react";
import { getAssetImage } from "@/lib/storage/imageStorageDb";
import type { ImageElement } from "../types";

interface ImageShapeProps {
  el: ImageElement;
}

/**
 * Resolves an image element's `src` — a browser-local `idb://` reference or a
 * plain URL/data URL — and renders it as an SVG `<image>`. `ElementShape` stays
 * pure; the async IDB lookup lives here. While unresolved (or missing) a dashed
 * placeholder box is shown instead.
 */
export function ImageShape({ el }: ImageShapeProps) {
  const [src, setSrc] = useState<string | null>(
    el.src.startsWith("idb://") ? null : el.src
  );

  useEffect(() => {
    if (!el.src.startsWith("idb://")) {
      setSrc(el.src);
      return;
    }
    let active = true;
    setSrc(null);
    getAssetImage(el.src.replace("idb://", "")).then((data) => {
      if (active) {
        setSrc(data);
      }
    });
    return () => {
      active = false;
    };
  }, [el.src]);

  if (!src) {
    return (
      <rect
        fill={el.fillColor ?? "transparent"}
        height={el.height}
        opacity={el.opacity ?? 1}
        rx={el.cornerRadius ?? 8}
        stroke={el.strokeColor ?? "var(--border)"}
        strokeDasharray="4 4"
        strokeWidth={el.strokeWidth ?? 1}
        width={el.width}
        x={el.x}
        y={el.y}
      />
    );
  }

  return (
    <image
      aria-label={el.alt ?? el.caption ?? "Image"}
      height={el.height}
      href={src}
      opacity={el.opacity ?? 1}
      preserveAspectRatio="xMidYMid slice"
      width={el.width}
      x={el.x}
      y={el.y}
    />
  );
}
