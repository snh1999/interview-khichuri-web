import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import type { TCustomEvent } from "@/components/dashboard/calendar/calendar.types.ts";
import { UpsertEventForm } from "@/components/dashboard/calendar/upsertEvent/UpsertEventForm.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { useCalendarStore } from "@/store/calendarStore.ts";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const CREATED_AT = "2026-01-01T00:00:00.000Z";

const fillEvent = async (
  user: ReturnType<typeof render>["user"],
  title: string
) => {
  await user.type(screen.getByLabelText("Title"), title);
  await user.type(
    screen.getByLabelText("Description"),
    "A short description for the event."
  );
};

describe("UpsertEventForm", () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it("shows validation errors when saved empty", async () => {
    useCalendarStore.getState().openCreateDrawer();
    const { user } = render(<UpsertEventForm />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
  });

  it("creates a custom event, toasts, and closes the drawer", async () => {
    let posted: unknown = null;
    server.use(
      http.post("*/api/v1/calendar/events", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        posted = body;
        return HttpResponse.json(
          {
            data: {
              ...body,
              createdAt: CREATED_AT,
              id: "evt-1",
              updatedAt: CREATED_AT,
            },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    useCalendarStore.getState().openCreateDrawer();
    const { user } = render(
      <>
        <UpsertEventForm />
        <Toaster />
      </>
    );

    await fillEvent(user, "Follow up with recruiter");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Event created")).toBeInTheDocument();
    expect(posted).toMatchObject({
      description: "A short description for the event.",
      source: "custom",
      startDate: expect.any(String),
      title: "Follow up with recruiter",
    });
    await waitFor(() =>
      expect(screen.queryByText("Add Event")).not.toBeInTheDocument()
    );
  });

  it("updates an existing event through PATCH", async () => {
    const editingEvent: TCustomEvent = {
      color: null,
      description: "",
      endDate: new Date("2026-03-01T11:00:00.000Z"),
      id: "evt-1",
      source: "custom",
      startDate: new Date("2026-03-01T10:00:00.000Z"),
      title: "Existing",
    };
    let patched: unknown = null;
    server.use(
      http.patch("*/api/v1/calendar/events/:id", async ({ request }) => {
        patched = await request.json();
        return HttpResponse.json({
          data: {
            ...editingEvent,
            id: "evt-1",
            title: "Renamed",
            updatedAt: CREATED_AT,
          },
          message: "OK",
          statusCode: 200,
        });
      })
    );
    useCalendarStore.getState().openEditDrawer(editingEvent);
    const { user } = render(
      <>
        <UpsertEventForm />
        <Toaster />
      </>
    );

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Renamed");
    await user.type(
      screen.getByLabelText("Description"),
      "A replacement description."
    );
    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(await screen.findByText("Event updated")).toBeInTheDocument();
    expect(patched).toMatchObject({
      source: "custom",
      title: "Renamed",
    });
  });

  it("shows an error toast when the create request fails", async () => {
    server.use(
      http.post("*/api/v1/calendar/events", () =>
        HttpResponse.json(
          { data: null, message: "boom", statusCode: 500 },
          { status: 500 }
        )
      )
    );
    useCalendarStore.getState().openCreateDrawer();
    const { user } = render(
      <>
        <UpsertEventForm />
        <Toaster />
      </>
    );

    await fillEvent(user, "Doomed event");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Failed to create event")
    ).toBeInTheDocument();
  });
});
