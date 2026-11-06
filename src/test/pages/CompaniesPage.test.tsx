import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw/http";
import { Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import type { ICompany } from "@/api/lookups";
import { CompaniesPage } from "@/pages/CompaniesPage.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const acme: ICompany = {
  aliases: ["Acme Corp"],
  careerPageUrl: "https://acme.test/careers",
  id: 11,
  name: "Acme",
};

const globex: ICompany = {
  aliases: ["Globex Inc"],
  id: 12,
  name: "Globex",
};

const renderPage = () =>
  render(
    <Routes>
      <Route element={<CompaniesPage />} path="/companies" />
    </Routes>,
    { route: "/companies" }
  );

describe("CompaniesPage", () => {
  it("lists companies alphabetically and filters them by name or alias", async () => {
    server.use(
      http.get(`${API}/company`, ({ request }) => {
        expect(new URL(request.url).searchParams.get("sort")).toBe("name:asc");
        return envelope([acme, globex]);
      })
    );

    const { user } = renderPage();

    expect(
      await screen.findByRole("heading", { name: "Companies" })
    ).toBeInTheDocument();
    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
    expect(screen.getByText("2 companies")).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((el) => el.textContent)
    ).toEqual(["Acme", "Globex"]);

    await user.type(
      screen.getByPlaceholderText("Search companies..."),
      "acme corp"
    );

    await waitFor(() => {
      expect(screen.queryByText("Globex")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 companies")).toBeInTheDocument();
  });

  it("shows an empty state when there are no companies", async () => {
    server.use(http.get(`${API}/company`, () => envelope([])));

    renderPage();

    expect(await screen.findByText("No companies yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Companies will appear here once job discovery is available."
      )
    ).toBeInTheDocument();
  });
});
