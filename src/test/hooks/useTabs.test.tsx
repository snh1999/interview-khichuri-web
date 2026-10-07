import { screen } from "@testing-library/react";
import { useSearchParams } from "react-router";
import { describe, expect, it } from "vitest";
import { useTabs } from "@/hooks/useTabs.ts";
import { render } from "@/test/render.tsx";

const TabsProbe = () => {
  const { currentTab, handleTabChange } = useTabs("overview");
  const [searchParameters] = useSearchParams();
  const showQuestions = () => handleTabChange("questions");

  return (
    <div>
      <output>{`tab=${currentTab}`}</output>
      <p>{`query=${searchParameters.toString()}`}</p>
      <button onClick={showQuestions} type="button">
        Questions
      </button>
    </div>
  );
};

describe("useTabs", () => {
  it("falls back to the default tab when the URL has none", () => {
    render(<TabsProbe />);

    expect(screen.getByText("tab=overview")).toBeInTheDocument();
  });

  it("reads the active tab from the URL", () => {
    render(<TabsProbe />, { route: "/?tab=notes" });

    expect(screen.getByText("tab=notes")).toBeInTheDocument();
  });

  it("writes the tab without dropping other query params", async () => {
    const { user } = render(<TabsProbe />, { route: "/?page=2" });

    await user.click(screen.getByRole("button", { name: "Questions" }));

    expect(screen.getByText("tab=questions")).toBeInTheDocument();
    expect(screen.getByText("query=page=2&tab=questions")).toBeInTheDocument();
  });
});
