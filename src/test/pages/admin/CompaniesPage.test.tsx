import { screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { IAdminCompany } from "@/api/admin/companies";
import { CompaniesPage } from "@/pages/admin/CompaniesPage.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";
const ACME_PATTERN = /Acme/u;
const ADDED_PATTERN = /Added/u;

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const company: IAdminCompany = {
  aliases: ["Acme Corp"],
  atsBoardId: null,
  careerPageUrl: "https://acme.test/careers",
  createdAt: "2026-06-15T12:00:00.000Z",
  enabled: false,
  id: 7,
  name: "Acme",
  provider: "scrape",
  updatedAt: "2026-06-15T12:00:00.000Z",
};

const serveCompanies = () => {
  const requests: URL[] = [];
  const deleted: string[] = [];
  const created: unknown[] = [];
  const patched: unknown[] = [];
  const crawled: string[] = [];
  server.use(
    http.get(`${API}/jobs/admin/failed`, () => envelope([])),
    http.get(`${API}/jobs/admin/ai-status`, () =>
      envelope({ enabled: true, pausedUntil: null })
    ),
    http.post(`${API}/company/:id/crawl`, ({ params }) => {
      crawled.push(String(params.id));
      return new HttpResponse(null, { status: 204 });
    }),
    http.get(`${API}/company`, ({ request }) => {
      requests.push(new URL(request.url));
      return envelope([company]);
    }),
    http.post(`${API}/company`, async ({ request }) => {
      created.push(await request.json());
      return envelope({ ...company, id: 8, name: "Globex" }, 201);
    }),
    http.patch(`${API}/company/:id`, async ({ params, request }) => {
      patched.push({
        id: String(params.id),
        ...(await request.json()),
      });
      return envelope({ ...company, name: "Acme Updated" });
    }),
    http.delete(`${API}/company/:id`, ({ params }) => {
      deleted.push(String(params.id));
      return new HttpResponse(null, { status: 204 });
    })
  );
  return {
    crawled,
    created,
    deleted,
    lastRequest: () => requests.at(-1),
    patched,
  };
};

describe("CompaniesPage", () => {
  it("renders companies with aliases, career page and created columns", async () => {
    serveCompanies();

    render(<CompaniesPage />, { route: "/admin/companies" });

    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: company.careerPageUrl })
    ).toHaveAttribute("href", company.careerPageUrl);
    expect(screen.getByText(ADDED_PATTERN)).toBeInTheDocument();
  });

  it("filters companies client-side as you type", async () => {
    serveCompanies();
    server.use(
      http.get(`${API}/company`, () =>
        envelope([
          company,
          { ...company, aliases: null, id: 8, name: "Globex" },
        ])
      )
    );

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("Acme");
    expect(screen.getByText("Globex")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Search companies"), "acm");

    await waitFor(() => {
      expect(screen.queryByText("Globex")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it("creates a company from the dialog", async () => {
    const { created } = serveCompanies();

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "New company" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Name"), "Globex");
    await user.click(within(dialog).getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(created).toHaveLength(1);
    });
    expect(created[0]).toMatchObject({
      aliases: [],
      careerPageUrl: null,
      name: "Globex",
    });
  });

  it("edits a company from the row actions form", async () => {
    const { patched } = serveCompanies();

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "Actions for Acme" }));
    await user.click(await screen.findByRole("menuitem", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText("Name")).toHaveValue("Acme");

    await user.clear(within(dialog).getByLabelText("Name"));
    await user.type(within(dialog).getByLabelText("Name"), "Acme Updated");
    await user.click(
      within(dialog).getByRole("button", { name: "Save changes" })
    );

    await waitFor(() => {
      expect(patched).toHaveLength(1);
    });
    expect(patched[0]).toMatchObject({
      aliases: ["Acme Corp"],
      atsBoardId: null,
      careerPageUrl: company.careerPageUrl,
      enabled: false,
      id: "7",
      links: [],
      name: "Acme Updated",
      provider: "scrape",
    });
  });

  it("crawls a company manually even when it is disabled", async () => {
    const { crawled } = serveCompanies();

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "Actions for Acme" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Crawl now" })
    );

    await waitFor(() => {
      expect(crawled).toEqual(["7"]);
    });
  });

  it("disables Crawl now when the company has no source", async () => {
    const { crawled } = serveCompanies();
    server.use(
      http.get(`${API}/company`, () =>
        envelope([{ ...company, careerPageUrl: null, provider: null }])
      )
    );

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "Actions for Acme" }));
    const item = await screen.findByRole("menuitem", { name: "Crawl now" });
    expect(item).toHaveAttribute("aria-disabled", "true");

    await user.click(item);
    expect(crawled).toEqual([]);
  });

  it("deletes a company only after confirmation", async () => {
    const { deleted } = serveCompanies();

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "Actions for Acme" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(ACME_PATTERN)).toBeInTheDocument();
    expect(deleted).toHaveLength(0);

    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleted).toEqual(["7"]);
    });
  });
});

describe("CompaniesPage research dossier", () => {
  it("sends a parsed dossier when creating a company", async () => {
    const { created } = serveCompanies();

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "New company" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Name"), "Globex");
    await user.click(screen.getByText("Advanced: research dossier"));
    await user.type(
      within(dialog).getByLabelText("Research dossier (JSON)"),
      '{{"summary":"grew fast"}'
    );
    await user.click(within(dialog).getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(created).toHaveLength(1);
    });
    expect(created[0]).toMatchObject({
      researchDossier: { summary: "grew fast" },
    });
  });

  it("rejects invalid dossier JSON without sending a request", async () => {
    const { created } = serveCompanies();

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "New company" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Name"), "Globex");
    await user.click(screen.getByText("Advanced: research dossier"));
    await user.type(
      within(dialog).getByLabelText("Research dossier (JSON)"),
      "{{not json"
    );
    await user.click(within(dialog).getByRole("button", { name: "Create" }));

    expect(
      await within(dialog).findByText("Research dossier must be valid JSON.")
    ).toBeInTheDocument();
    expect(created).toHaveLength(0);
  });

  it("clears an existing dossier when the field is emptied", async () => {
    const { patched } = serveCompanies();
    server.use(
      http.get(`${API}/company`, () =>
        envelope([{ ...company, researchDossier: { summary: "old" } }])
      )
    );

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "Actions for Acme" }));
    await user.click(await screen.findByRole("menuitem", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog");
    await user.click(screen.getByText("Advanced: research dossier"));
    await user.clear(within(dialog).getByLabelText("Research dossier (JSON)"));
    await user.click(
      within(dialog).getByRole("button", { name: "Save changes" })
    );

    await waitFor(() => {
      expect(patched).toHaveLength(1);
    });
    expect(patched[0]).toMatchObject({ researchDossier: null });
  });
});

describe("CompaniesPage source rendering", () => {
  it("renders each provider fallback and the empty search state", async () => {
    serveCompanies();
    server.use(
      http.get(`${API}/company`, () =>
        envelope([
          company,
          {
            ...company,
            aliases: null,
            crawledAt: "2026-06-20T12:00:00.000Z",
            enabled: true,
            id: 8,
            name: "NoSource",
            provider: null,
          },
          {
            ...company,
            aliases: null,
            atsBoardId: null,
            crawlError: "boom",
            crawledAt: null,
            id: 9,
            name: "AtsCo",
            provider: "greenhouse",
          },
          {
            ...company,
            aliases: null,
            careerPageUrl: "ftp://acme.test/jobs",
            id: 10,
            name: "BadUrl",
          },
        ])
      )
    );

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("NoSource");

    expect(screen.getByText("None")).toBeInTheDocument();
    expect(screen.getByText("No URL")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getAllByText("Never").length).toBeGreaterThan(0);

    await user.type(screen.getByPlaceholderText("Search companies"), "zzz");
    expect(await screen.findByText("No companies found.")).toBeInTheDocument();
  });

  it("shows tracked user counts when deleting a tracked company fails", async () => {
    serveCompanies();
    server.use(
      http.delete(`${API}/company/:id`, () =>
        HttpResponse.json(
          {
            message: "Conflict",
            statusCode: 409,
            trackedUserCount: 3,
          },
          { status: 409 }
        )
      )
    );

    const { user } = render(<CompaniesPage />, { route: "/admin/companies" });
    await screen.findByText("Acme");

    await user.click(screen.getByRole("button", { name: "Actions for Acme" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(
      await screen.findByText("3 users track jobs from this company.")
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });
});
