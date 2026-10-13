import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditableText } from "@/components/common/EditableText.tsx";
import { render } from "@/test/render.tsx";

describe("EditableText", () => {
  it("edits through the pencil button and saves the trimmed value", async () => {
    const onSave = vi.fn();
    const view = render(
      <EditableText initialValue="Old" onSave={onSave}>
        <span>Old</span>
      </EditableText>
    );

    await view.user.click(
      screen.getByRole("button", { name: "Rename preset" })
    );
    const input = screen.getByDisplayValue("Old");
    await view.user.clear(input);
    await view.user.type(input, "New{Enter}");

    expect(onSave).toHaveBeenCalledWith("New");
  });
});
