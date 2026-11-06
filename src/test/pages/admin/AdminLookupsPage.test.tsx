import { screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { ILookupEntry } from "@/api/lookups";
import AdminLookupsPage from "@/pages/admin/AdminLookupsPage.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";
const ENTRY_PATTERN = /Staff Engineer/u;

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const role: ILookupEntry = {
  id: 5,
  isApproved: true,
  name: "Staff Engineer",
};

const serveLookups = () => {
  const created: unknown[] = [];
  const deleted: string[] = [];
  const patched: unknown[] = [];
  server.use(
    http.get(`${API}/lookups/roles`, () => envelope([role])),
    http.get(`${API}/lookups/topics`, () => envelope([])),
    http.get(`${API}/lookups/industries`, () => envelope([])),
    http.post(`${API}/lookups/roles`, async ({ request }) => {
      created.push(await request.json());
      return envelope({ ...role, id: 9, name: "Engineering Manager" });
    }),
    http.patch(`${API}/lookups/roles/:id`, async ({ params, request }) => {
      patched.push({
        id: String(params.id),
        ...(await request.json()),
      });
      return envelope({ ...role, isApproved: false });
    }),
    http.delete(`${API}/lookups/:schema/:id`, ({ params }) => {
      deleted.push(`${params.schema}/${params.id}`);
      return new HttpResponse(null, { status: 204 });
    })
  );
  return { created, deleted, patched };
};

describe("AdminLookupsPage", () => {
  it("renders lookup entries from the server", async () => {
    serveLookups();

    render(<AdminLookupsPage />, { route: "/admin/lookups" });

    expect(await screen.findByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("uses singular labels and per-tab counts", async () => {
    serveLookups();

    const { user } = render(<AdminLookupsPage />, { route: "/admin/lookups" });
    await screen.findByText("Staff Engineer");

    expect(
      screen.queryByRole("heading", { name: "Lookups" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Roles" })).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add role" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Industries" }));

    expect(
      await screen.findByRole("button", { name: "Add industry" })
    ).toBeInTheDocument();
  });

  it("deletes a lookup entry only after confirmation", async () => {
    const { deleted } = serveLookups();

    const { user } = render(<AdminLookupsPage />, { route: "/admin/lookups" });
    await screen.findByText("Staff Engineer");

    await user.click(
      screen.getByRole("button", { name: "Actions for Staff Engineer" })
    );
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(ENTRY_PATTERN)).toBeInTheDocument();
    expect(deleted).toHaveLength(0);

    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleted).toEqual(["roles/5"]);
    });
  });

  it("creates a lookup entry from the add dialog", async () => {
    const { created } = serveLookups();

    const { user } = render(<AdminLookupsPage />, { route: "/admin/lookups" });
    await screen.findByText("Staff Engineer");

    await user.click(screen.getByRole("button", { name: "Add role" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Name"),
      "Engineering Manager"
    );
    await user.click(within(dialog).getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(created).toEqual([{ name: "Engineering Manager" }]);
    });
  });

  it("prefills the edit dialog and saves the updated entry", async () => {
    const { patched } = serveLookups();

    const { user } = render(<AdminLookupsPage />, { route: "/admin/lookups" });
    await screen.findByText("Staff Engineer");

    await user.click(
      screen.getByRole("button", { name: "Actions for Staff Engineer" })
    );
    await user.click(await screen.findByRole("menuitem", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText("Name")).toHaveValue("Staff Engineer");
    expect(within(dialog).getByRole("checkbox")).toBeChecked();

    await user.clear(within(dialog).getByLabelText("Name"));
    await user.type(
      within(dialog).getByLabelText("Name"),
      "Principal Engineer"
    );
    await user.click(within(dialog).getByRole("checkbox"));
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(patched).toEqual([
        { id: "5", isApproved: false, name: "Principal Engineer" },
      ]);
    });
  });
});
