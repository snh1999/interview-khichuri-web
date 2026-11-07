import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePaste } from "@/hooks/usePaste.ts";

const pasted = (text: string, target: EventTarget = document.body) => {
  const event = new Event("paste", { bubbles: true });
  Object.defineProperty(event, "clipboardData", {
    value: { getData: () => text },
  });
  act(() => {
    target.dispatchEvent(event);
  });
};

describe("usePaste", () => {
  it("forwards pasted text", () => {
    const onPaste = vi.fn();
    renderHook(() => usePaste(onPaste));

    pasted("hello");

    expect(onPaste).toHaveBeenCalledWith("hello");
  });

  it("ignores blank pastes", () => {
    const onPaste = vi.fn();
    renderHook(() => usePaste(onPaste));

    pasted("   ");

    expect(onPaste).not.toHaveBeenCalled();
  });

  it("ignores pastes into editable elements", () => {
    const onPaste = vi.fn();
    renderHook(() => usePaste(onPaste));
    const input = document.createElement("input");
    document.body.append(input);

    pasted("typed", input);

    input.remove();
    expect(onPaste).not.toHaveBeenCalled();
  });

  it("does nothing when disabled", () => {
    const onPaste = vi.fn();
    renderHook(() => usePaste(onPaste, false));

    pasted("hello");

    expect(onPaste).not.toHaveBeenCalled();
  });
});
