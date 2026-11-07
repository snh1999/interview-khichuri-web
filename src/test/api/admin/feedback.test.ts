import { describe, expect, it } from "vitest";
import { FEEDBACK_TYPE_LABELS, FEEDBACK_TYPES } from "@/api/admin/feedback";

describe("feedback types", () => {
  it("includes general feedback in the filter and label maps", () => {
    expect(FEEDBACK_TYPES).toContain("feedback");
    expect(FEEDBACK_TYPE_LABELS.feedback).toBe("General feedback");
  });
});
