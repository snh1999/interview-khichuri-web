import { type RefCallback, useCallback, useEffect, useState } from "react";

export interface IElementSize {
  width: number;
  height: number;
}

/**
 * Tracks an element's rendered box so an SVG viewBox can match it 1:1 in
 * pixels. Without this, `preserveAspectRatio` scales the drawing uniformly and
 * letterboxes it inside a differently-proportioned container.
 */
export const useElementSize = <T extends HTMLElement>(): {
  ref: RefCallback<T>;
} & IElementSize => {
  const [element, setElement] = useState<T | null>(null);
  const [size, setSize] = useState<IElementSize>({ width: 0, height: 0 });

  const ref: RefCallback<T> = useCallback((node) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box) {
        setSize({ width: box.width, height: box.height });
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return { ref, ...size };
};
