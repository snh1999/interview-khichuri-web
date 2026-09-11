import type { AutoAnimateOptions } from "@formkit/auto-animate";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { type RefCallback, useCallback, useRef } from "react";

export const useStrictSafeAutoAnimate = (
  options?: Partial<AutoAnimateOptions>
): [RefCallback<HTMLElement>] => {
  const initializedElement = useRef<HTMLElement | null>(null);
  const [parent] = useAutoAnimate(options);

  const ref: RefCallback<HTMLElement> = useCallback(
    (node) => {
      if (node && node !== initializedElement.current) {
        initializedElement.current = node;
        parent(node);
      }
    },
    [parent]
  );

  return [ref];
};
