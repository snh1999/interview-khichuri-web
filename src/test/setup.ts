import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toast } from "sonner";

import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { server } from "./msw/server.ts";

vi.stubEnv("VITE_API_URL", "http://localhost:3000");

Object.defineProperty(window, "matchMedia", {
  value: (query: string) => ({
    addEventListener: () => undefined,
    dispatchEvent: () => false,
    matches: false,
    media: query,
    removeEventListener: () => undefined,
  }),
  writable: true,
});

Object.defineProperty(Element.prototype, "animate", {
  value: () => {
    const listeners: Array<() => void> = [];
    const finished = Promise.resolve();
    finished.then(() => {
      for (const listener of listeners) {
        listener();
      }
    });
    return {
      addEventListener: (_event: string, listener: () => void) => {
        listeners.push(listener);
      },
      cancel: () => undefined,
      finished,
      removeEventListener: () => undefined,
    };
  },
  writable: true,
});

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {
      /* jsdom no-op */
    }
    unobserve() {
      /* jsdom no-op */
    }
    disconnect() {
      /* jsdom no-op */
    }
  }
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  toast.dismiss();
  window.localStorage.clear();
});

afterAll(() => {
  server.close();
});
