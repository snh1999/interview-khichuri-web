import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ElementShape } from "@/components/portfolio/sketch/canvas/ElementShape.tsx";
import type { ImageElement } from "@/components/portfolio/sketch/types";
import { saveAssetImage } from "@/lib/storage/imageStorageDb";
import { render } from "@/test/render.tsx";

const imageEl = (overrides: Partial<ImageElement> = {}): ImageElement => ({
  id: "img-1",
  type: "image",
  src: "https://example.com/a.png",
  alt: "A photo",
  x: 10,
  y: 20,
  width: 100,
  height: 80,
  zIndex: 1,
  ...overrides,
});

describe("ElementShape image elements", () => {
  it("renders an image element with its src", () => {
    render(
      <svg>
        <title>canvas</title>
        <ElementShape el={imageEl()} isSelected={false} />
      </svg>
    );

    expect(screen.getByLabelText("A photo")).toHaveAttribute(
      "href",
      "https://example.com/a.png"
    );
  });

  it("resolves a browser-local idb:// asset before rendering", async () => {
    await saveAssetImage("img-asset", "data:image/png;base64,CCCC");
    render(
      <svg>
        <title>canvas</title>
        <ElementShape
          el={imageEl({ alt: "Local image", src: "idb://img-asset" })}
          isSelected={false}
        />
      </svg>
    );

    expect(await screen.findByLabelText("Local image")).toHaveAttribute(
      "href",
      "data:image/png;base64,CCCC"
    );
  });
});
