import { useEffect, useRef } from "react";

const EDITABLE =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

export const usePaste = (onPaste: (text: string) => void, enabled = true) => {
  const handler = useRef(onPaste);
  useEffect(() => {
    handler.current = onPaste;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const listener = (e: ClipboardEvent) => {
      if (e.target instanceof Element && e.target.closest(EDITABLE)) {
        return;
      }
      const text = e.clipboardData?.getData("text/plain") ?? "";
      if (text.trim()) {
        handler.current(text);
      }
    };
    document.addEventListener("paste", listener);
    return () => document.removeEventListener("paste", listener);
  }, [enabled]);
};
