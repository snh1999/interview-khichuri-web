// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioCreateDialog } from "@/components/portfolio/PortfolioCreateDialog";
import { getPortfolio, setActiveUserId } from "@/lib/storage/portfolioDb";
import { render } from "@/test/render";

let userSeq = 0;
const nextUser = () => {
  userSeq += 1;
  return `create-${userSeq}`;
};

const noop = () => undefined;

beforeEach(() => {
  setActiveUserId(nextUser());
});

describe("PortfolioCreateDialog", () => {
  it("validates that the title is present and long enough", async () => {
    const { user } = render(<PortfolioCreateDialog onOpenChange={noop} open />);

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Title too short")).toBeInTheDocument();
  });

  it("creates a template portfolio with profile tokens", async () => {
    const onCreated = vi.fn();
    const { user } = render(
      <PortfolioCreateDialog onCreated={onCreated} onOpenChange={noop} open />
    );

    await user.type(screen.getByLabelText("Title"), "Fintech Lead");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    const record = await getPortfolio(onCreated.mock.calls[0][0]);
    expect(record?.title).toBe("Fintech Lead");
    expect(record?.elements.length).toBeGreaterThan(0);
    expect(record?.description).toBe(
      "Custom portfolio wireframe and style moodboard"
    );
  });

  it("creates a blank canvas portfolio when the template is unchecked", async () => {
    const onCreated = vi.fn();
    const { user } = render(
      <PortfolioCreateDialog onCreated={onCreated} onOpenChange={noop} open />
    );

    await user.type(screen.getByLabelText("Title"), "Blank One");
    await user.type(screen.getByLabelText("Description"), "A blank canvas");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    const record = await getPortfolio(onCreated.mock.calls[0][0]);
    expect(record?.title).toBe("Blank One");
    expect(record?.elements).toEqual([]);
    expect(record?.description).toBe("A blank canvas");
  });

  it("resets the form whenever it reopens", async () => {
    const onOpenChange = vi.fn();
    const { user, rerender } = render(
      <PortfolioCreateDialog onOpenChange={onOpenChange} open />
    );

    await user.type(screen.getByLabelText("Title"), "Draft");
    rerender(
      <PortfolioCreateDialog onOpenChange={onOpenChange} open={false} />
    );
    rerender(<PortfolioCreateDialog onOpenChange={onOpenChange} open />);

    expect(await screen.findByLabelText("Title")).toHaveValue("");
  });

  it("closes without creating when cancelled", async () => {
    const onOpenChange = vi.fn();
    const { user } = render(
      <PortfolioCreateDialog onOpenChange={onOpenChange} open />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
