import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw/http";
import { Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { CompanyDetailPage } from "@/pages/CompanyDetailPage.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const job = {
  companyId: 11,
  companyName: "Acme",
  createdAt: "2026-01-01T00:00:00.000Z",
  description: "Build things",
  id: "job-1",
  state: "ok",
  title: "Senior Engineer",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const renderPage = () =>
  render(
    <Routes>
      <Route element={<CompanyDetailPage />} path="/companies/:companyId" />
    </Routes>,
    { route: "/companies/11" }
  );

describe("CompanyDetailPage", () => {
  it("shows the company details and its open jobs", async () => {
    server.use(
      http.get(`${API}/company/11`, () =>
        envelope({
          aliases: ["Acme Corp"],
          careerPageUrl: "https://acme.test/careers",
          id: 11,
          links: [{ type: "linkedin", url: "https://acme.test/linkedin" }],
          name: "Acme",
        })
      ),
      http.get(`${API}/company/11/jobs`, () => envelope([job]))
    );

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Acme" })
    ).toBeInTheDocument();
    expect(screen.getByText("Also known as Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Career page" })).toHaveAttribute(
      "href",
      "https://acme.test/careers"
    );
    expect(screen.getByRole("link", { name: "linkedin" })).toHaveAttribute(
      "href",
      "https://acme.test/linkedin"
    );
    expect(screen.getByRole("button", { name: "Track" })).toBeInTheDocument();
  });

  it("shows an empty state when the company has no jobs", async () => {
    server.use(
      http.get(`${API}/company/11`, () => envelope({ id: 11, name: "Acme" })),
      http.get(`${API}/company/11/jobs`, () => envelope([]))
    );

    renderPage();

    expect(await screen.findByText("No open jobs")).toBeInTheDocument();
    expect(
      screen.getByText("This company has no discoverable jobs right now.")
    ).toBeInTheDocument();
  });
});
