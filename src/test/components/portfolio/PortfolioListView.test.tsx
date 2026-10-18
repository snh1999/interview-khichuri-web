// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { useLocation } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { PortfolioListView } from "@/components/portfolio/PortfolioListView";
import { buildNewPortfolio } from "@/components/portfolio/portfolio.helpers";
import { putPortfolio, setActiveUserId } from "@/lib/storage/portfolioDb";
import { render } from "@/test/render";

let userSeq = 0;
beforeEach(() => {
  userSeq += 1;
  setActiveUserId(`list-${userSeq}`);
});

const importFile = (content: string, name = "portfolio.json") => {
  const input = document.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("file input not found");
  }
  const file = new File([content], name, { type: "application/json" });
  fireEvent.change(input, { target: { files: [file] } });
};

const LocationProbe = () => {
  const { pathname } = useLocation();
  return <p>{pathname}</p>;
};

const EMPTY_RE = /No portfolios yet/;
const EDITOR_PATH_RE = /^\/portfolio\//;

describe("PortfolioListView", () => {
  it("shows the empty state when there are no portfolios", async () => {
    render(<PortfolioListView />);
    expect(await screen.findByText(EMPTY_RE)).toBeInTheDocument();
  });

  it("lists seeded portfolios", async () => {
    await putPortfolio({ ...buildNewPortfolio({ title: "Alpha" }), id: "a" });
    render(<PortfolioListView />);
    expect(await screen.findByText("Alpha")).toBeInTheDocument();
  });

  it("opens the create dialog from the empty-state call to action", async () => {
    const { user } = render(<PortfolioListView />);
    await user.click(
      await screen.findByRole("button", { name: "Create your first portfolio" })
    );
    expect(
      await screen.findByText(
        "Start from the starter sketch template or a blank canvas."
      )
    ).toBeInTheDocument();
  });

  it("imports a valid portfolio JSON file and opens the editor", async () => {
    render(
      <>
        <PortfolioListView />
        <LocationProbe />
      </>
    );
    await screen.findByText(EMPTY_RE);

    importFile(JSON.stringify({ title: "Imported", elements: [] }));

    expect(await screen.findByText(EDITOR_PATH_RE)).toBeInTheDocument();
  });

  it("reports malformed JSON without adding a portfolio", async () => {
    render(<PortfolioListView />);
    await screen.findByText(EMPTY_RE);

    importFile("{not-json");

    await waitFor(() =>
      expect(screen.queryByText(EMPTY_RE)).toBeInTheDocument()
    );
  });

  it("rejects JSON that has no elements array", async () => {
    render(<PortfolioListView />);
    await screen.findByText(EMPTY_RE);

    importFile(JSON.stringify({ title: "Nope" }));

    await waitFor(() =>
      expect(screen.queryByText("Nope")).not.toBeInTheDocument()
    );
    expect(screen.getByText(EMPTY_RE)).toBeInTheDocument();
  });

  it("ignores an import with no file selected", async () => {
    render(<PortfolioListView />);
    await screen.findByText(EMPTY_RE);

    const input = document.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error("file input not found");
    }
    fireEvent.change(input, { target: { files: [] } });

    expect(screen.getByText(EMPTY_RE)).toBeInTheDocument();
  });
});
