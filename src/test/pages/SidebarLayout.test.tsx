import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { SidebarLayout } from "@/pages/SidebarLayout.tsx";
import { render } from "@/test/render.tsx";

const MENU_FOR_USER = /Menu for/u;

const renderLayout = (hideSidebar: boolean) =>
  render(
    <Routes>
      <Route
        element={<SidebarLayout hideSidebar={hideSidebar} />}
        path="/interviews/:interviewId"
      >
        <Route element={<p>Interview content</p>} index />
      </Route>
    </Routes>,
    { route: "/interviews/int-1" }
  );

describe("SidebarLayout", () => {
  it("shows home and back instead of the breadcrumb without a sidebar", async () => {
    const view = renderLayout(true);

    expect(await view.findByText("Interview content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go home" })).toHaveAttribute(
      "href",
      "/dashboard"
    );
    expect(
      screen.queryByRole("link", { name: "Interviews" })
    ).not.toBeInTheDocument();
  });

  it("renders the sidebar navigation and header when the sidebar is shown", async () => {
    const view = renderLayout(false);

    expect(await view.findByText("Interview content")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: MENU_FOR_USER })
    ).toBeInTheDocument();
  });

  it("renders the report a bug button at the bottom of the sidebar", async () => {
    const view = renderLayout(false);

    await view.findByText("Interview content");
    await view.user.click(
      screen.getByRole("button", { name: "Toggle Sidebar" })
    );

    expect(
      await screen.findByRole("button", { name: "Report a bug" })
    ).toBeInTheDocument();
  });

  it("opens the bug report dialog from the sidebar footer", async () => {
    const view = renderLayout(false);

    await view.findByText("Interview content");
    await view.user.click(
      screen.getByRole("button", { name: "Toggle Sidebar" })
    );
    await view.user.click(
      await screen.findByRole("button", { name: "Report a bug" })
    );

    expect(await screen.findByLabelText("Message")).toBeInTheDocument();
  });
});
