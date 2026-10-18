// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { buildNewPortfolio } from "@/components/portfolio/portfolio.helpers";
import { putPortfolio, setActiveUserId } from "@/lib/storage/portfolioDb";
import { PortfolioEditorPage } from "@/pages/PortfolioEditorPage";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import { render } from "@/test/render";

let userSeq = 0;
beforeEach(() => {
  userSeq += 1;
  setActiveUserId(`editor-${userSeq}`);
  useSketchBuilderStore.setState(useSketchBuilderStore.getInitialState(), true);
});

const LocationProbe = () => {
  const { pathname, search } = useLocation();
  return <p>{`${pathname}${search}`}</p>;
};

const renderAt = (path: string) =>
  render(
    <Routes>
      <Route element={<PortfolioEditorPage />} path="/portfolio/:portfolioId" />
      <Route element={<LocationProbe />} path="/resumes" />
    </Routes>,
    { route: path }
  );

describe("PortfolioEditorPage", () => {
  it("seeds the sketch page once the portfolio loads", async () => {
    const record = { ...buildNewPortfolio({ title: "Alpha" }), id: "p1" };
    await putPortfolio(record);

    renderAt("/portfolio/p1");

    expect(await screen.findByText("Canvas is Empty")).toBeInTheDocument();
    expect(useSketchBuilderStore.getState().draft?.id).toBe("p1");
  });

  it("redirects to the portfolio tab when the portfolio is missing", async () => {
    renderAt("/portfolio/missing");

    expect(
      await screen.findByText("/resumes?tab=portfolio")
    ).toBeInTheDocument();
  });
});
