// @vitest-environment jsdom
import { screen, waitFor, within } from "@testing-library/react";
import { useLocation } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { PortfolioListItem } from "@/components/portfolio/PortfolioListItem";
import { buildNewPortfolio } from "@/components/portfolio/portfolio.helpers";
import type { CanvasElement } from "@/components/portfolio/sketch/types";
import {
  getPortfolios,
  putPortfolio,
  setActiveUserId,
} from "@/lib/storage/portfolioDb";
import { render } from "@/test/render";

let userSeq = 0;
beforeEach(() => {
  userSeq += 1;
  setActiveUserId(`item-${userSeq}`);
});

const frame = (id: string): CanvasElement =>
  ({
    id,
    type: "frame",
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    zIndex: 1,
  }) as CanvasElement;

const EDITED_RE = /^Edited /;
const OPEN_MENU_RE = /Open in editor/;
const DUPLICATE_RE = /Duplicate/;

const LocationProbe = () => {
  const { pathname } = useLocation();
  return <p>{pathname}</p>;
};

const makePortfolio = (id: string, frames: number, updatedAt: string) => ({
  ...buildNewPortfolio({ title: id }),
  id,
  updatedAt,
  elements: Array.from({ length: frames }, (_, i) => frame(`${id}-f${i}`)),
});

describe("PortfolioListItem", () => {
  it("renders the title, frame count and edited date", () => {
    render(
      <PortfolioListItem
        portfolio={makePortfolio("Alpha", 2, "2024-01-01T00:00:00.000Z")}
      />
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("2 frames")).toBeInTheDocument();
    expect(screen.getByText(EDITED_RE)).toBeInTheDocument();
  });

  it("uses the singular frame label", () => {
    render(
      <PortfolioListItem portfolio={makePortfolio("Solo", 1, "2024-01-01")} />
    );
    expect(screen.getByText("1 frame")).toBeInTheDocument();
  });

  it("navigates to the editor from the title and the menu", async () => {
    const { user } = render(
      <>
        <PortfolioListItem
          portfolio={makePortfolio("Alpha", 0, "2024-01-01")}
        />
        <LocationProbe />
      </>
    );

    await user.click(screen.getByText("Alpha"));
    expect(screen.getByText("/portfolio/Alpha")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Actions for Alpha" }));
    await user.click(
      await screen.findByRole("menuitem", { name: OPEN_MENU_RE })
    );
    expect(screen.getByText("/portfolio/Alpha")).toBeInTheDocument();
  });

  it("duplicates a portfolio, optionally copying the code project", async () => {
    await putPortfolio(makePortfolio("Alpha", 1, "2024-01-01"));
    const { user } = render(
      <PortfolioListItem portfolio={makePortfolio("Alpha", 1, "2024-01-01")} />
    );

    await user.click(screen.getByRole("button", { name: "Actions for Alpha" }));
    await user.click(
      await screen.findByRole("menuitem", { name: DUPLICATE_RE })
    );

    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("checkbox"));
    await user.click(within(dialog).getByRole("button", { name: "Duplicate" }));

    await waitFor(async () => {
      const all = await getPortfolios();
      expect(all.map((p) => p.title)).toContain("Alpha (Copy)");
    });
  });

  it("deletes a portfolio after confirming", async () => {
    await putPortfolio(makePortfolio("Alpha", 0, "2024-01-01"));
    const { user } = render(
      <PortfolioListItem portfolio={makePortfolio("Alpha", 0, "2024-01-01")} />
    );

    await user.click(screen.getByRole("button", { name: "Actions for Alpha" }));
    await user.click(
      await screen.findByRole("button", { name: "Delete Alpha" })
    );

    await user.click(
      await screen.findByRole("button", { name: "Delete portfolio" })
    );

    await waitFor(async () => expect(await getPortfolios()).toEqual([]));
  });
});
