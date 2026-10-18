import { describe, expect, it } from "vitest";

import type {
  CanvasElement,
  FrameElement,
} from "@/components/portfolio/sketch/types.ts";
import {
  applyProfileTokens,
  createInitialPortfolio,
  generateUniqueElementId,
  INITIAL_SKETCH_ELEMENTS,
  remapElementIds,
} from "@/components/portfolio/sketch/utils/defaultPortfolios.ts";
import { PORTFOLIO_PAGE_TEMPLATES } from "@/components/portfolio/sketch/utils/portfolioTemplates.ts";
import { STAMP_DEFINITIONS } from "@/components/portfolio/sketch/utils/stampConstants.ts";

const ID_PATTERN = /^hero-[a-z0-9]+$/;

const textOf = (elements: CanvasElement[]): string =>
  elements
    .flatMap((el) => {
      if (el.type === "stamp") {
        return [el.label ?? "", el.sublabel ?? ""];
      }
      if (el.type === "frame") {
        return [el.title, el.description ?? ""];
      }
      return [];
    })
    .join("\n");

describe("remapElementIds", () => {
  it("gives every element a fresh, unique, prefix-free id", () => {
    const base = createInitialPortfolio();
    const remapped = remapElementIds(base.elements);

    expect(remapped).toHaveLength(base.elements.length);
    const ids = remapped.map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(base.elements.some((el) => ids.includes(el.id))).toBe(false);
  });

  it("repoints child frame references at their rebased frames", () => {
    const base = createInitialPortfolio();
    const remapped = remapElementIds(base.elements);
    const remappedIds = remapped.map((el) => el.id);
    const childFrameIds = remapped
      .map((el) => el.frameId)
      .filter((frameId): frameId is string => Boolean(frameId));

    expect(childFrameIds.length).toBeGreaterThan(0);
    expect(
      childFrameIds.every((frameId) => remappedIds.includes(frameId))
    ).toBe(true);
    expect(
      childFrameIds.every((frameId) => !frameId.startsWith("frame-portfolio-"))
    ).toBe(true);
  });

  it("repoints parent-page references so the page hierarchy survives a clone", () => {
    const elements: FrameElement[] = [
      {
        id: "a",
        type: "frame",
        title: "A",
        preset: "desktop",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        zIndex: 1,
      },
      {
        id: "b",
        type: "frame",
        title: "B",
        preset: "desktop",
        parentPageId: "a",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        zIndex: 2,
      },
    ];

    const [frameA, frameB] = remapElementIds(elements);
    if (frameA.type !== "frame" || frameB.type !== "frame") {
      throw new Error("expected both elements to be frames");
    }

    expect(frameB.parentPageId).toBe(frameA.id);
    expect(frameB.parentPageId).not.toBe("a");
  });
});

describe("generateUniqueElementId", () => {
  it("prefixes ids so element groups are recognizable", () => {
    expect(generateUniqueElementId("hero")).toMatch(ID_PATTERN);
  });
});

describe("PORTFOLIO_PAGE_TEMPLATES", () => {
  it("builds every template into a frame with uniquely-id'ed framed children", () => {
    expect(PORTFOLIO_PAGE_TEMPLATES.length).toBeGreaterThan(0);
    for (const template of PORTFOLIO_PAGE_TEMPLATES) {
      const elements = template.elements(`frame-${template.id}`, 60, 60);
      expect(elements.length).toBeGreaterThan(3);

      const [frame, ...children] = elements;
      expect(frame.type).toBe("frame");
      expect(frame.id).toBe(`frame-${template.id}`);

      const ids = elements.map((el: CanvasElement) => el.id);
      expect(new Set(ids).size).toBe(ids.length);

      expect(
        children.every(
          (el: CanvasElement) =>
            "frameId" in el && (el as { frameId: string }).frameId === frame.id
        )
      ).toBe(true);
    }
  });
});

describe("starter sketch content", () => {
  const PERSONAS = [
    "Alex Morgan",
    "Elena",
    "Marcus Chen",
    "Sarah",
    "Kai Takahashi",
    "Loom Studio",
    "alex@example.dev",
    "elena@example.design",
    "marcus@example.systems",
    "sarah@example.pm",
    "kai@example.art",
    "studio@example.dev",
  ];

  it("ships no demo persona anywhere in the sketch, template, or stamp defaults", () => {
    const templateElements = PORTFOLIO_PAGE_TEMPLATES.flatMap((template) =>
      template.elements(`frame-${template.id}`, 0, 0)
    );
    const text = [
      textOf(INITIAL_SKETCH_ELEMENTS),
      textOf(templateElements),
      Object.values(STAMP_DEFINITIONS)
        .map((def) => `${def.label}\n${def.sublabel}`)
        .join("\n"),
    ].join("\n");

    for (const persona of PERSONAS) {
      expect(text).not.toContain(persona);
    }
  });
});

describe("applyProfileTokens", () => {
  const stamp: CanvasElement = {
    id: "s",
    type: "stamp",
    stampType: "hero",
    label: "{{name}} — {{title}}",
    sublabel: "{{email}}",
    zIndex: 1,
  };

  it("replaces tokens with the profile's values", () => {
    const [result] = applyProfileTokens([stamp], {
      name: "Ada Lovelace",
      title: "Analytical Engine Programmer",
      email: "ada@example.com",
    });

    expect(result).toMatchObject({
      label: "Ada Lovelace — Analytical Engine Programmer",
      sublabel: "ada@example.com",
    });
  });

  it("falls back to neutral placeholders when the profile is missing or blank", () => {
    const [result] = applyProfileTokens([stamp], {
      name: "  ",
      title: "",
      email: "",
    });

    expect(result).toMatchObject({
      label: "Your Name — Your Title",
      sublabel: "you@example.com",
    });
  });

  it("leaves no unresolved token in every starter template", () => {
    for (const template of PORTFOLIO_PAGE_TEMPLATES) {
      const resolved = applyProfileTokens(
        template.elements(`frame-${template.id}`, 0, 0),
        { name: "Ada", title: "Engineer", email: "ada@example.com" }
      );
      expect(textOf(resolved)).not.toContain("{{");
    }
  });
});
