// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  cleanupOrphanAssetImages,
  cloneAssetImage,
  deleteAssetImage,
  getAssetImage,
  getMoodboardImage,
  saveAssetImage,
  saveMoodboardImage,
} from "@/lib/storage/imageStorageDb";

const id = (() => {
  let n = 0;
  return () => {
    n += 1;
    return `asset-${n}`;
  };
})();

beforeEach(() => {
  // Each test writes fresh ids so rows can't bleed between tests.
});

describe("imageStorageDb", () => {
  it("saves and reads an image back", async () => {
    const key = id();
    await expect(
      saveAssetImage(key, "data:image/png;base64,AAA")
    ).resolves.toBe(true);
    await expect(getAssetImage(key)).resolves.toBe("data:image/png;base64,AAA");
  });

  it("returns null for an unknown image", async () => {
    await expect(getAssetImage("does-not-exist")).resolves.toBeNull();
  });

  it("clones an image to a new id and reports a missing source", async () => {
    const source = id();
    const target = id();
    await saveAssetImage(source, "data:image/png;base64,BBB");

    await expect(cloneAssetImage(source, target)).resolves.toBe(true);
    await expect(getAssetImage(target)).resolves.toBe(
      "data:image/png;base64,BBB"
    );

    await expect(cloneAssetImage("missing", id())).resolves.toBe(false);
  });

  it("deletes an image without throwing when it is absent", async () => {
    const key = id();
    await saveAssetImage(key, "data:image/png;base64,CCC");

    await deleteAssetImage(key);
    await expect(getAssetImage(key)).resolves.toBeNull();
    await expect(deleteAssetImage(key)).resolves.toBeUndefined();
  });

  it("cleans up every asset that is not in the valid set", async () => {
    const keep = id();
    const drop = id();
    const alsoDrop = id();
    await saveAssetImage(keep, "keep");
    await saveAssetImage(drop, "drop");
    await saveAssetImage(alsoDrop, "drop");

    await cleanupOrphanAssetImages(new Set([keep]));

    await expect(getAssetImage(keep)).resolves.toBe("keep");
    await expect(getAssetImage(drop)).resolves.toBeNull();
    await expect(getAssetImage(alsoDrop)).resolves.toBeNull();
  });

  it("exposes moodboard aliases", async () => {
    const key = id();
    await saveMoodboardImage(key, "mood");
    await expect(getMoodboardImage(key)).resolves.toBe("mood");
  });
});
