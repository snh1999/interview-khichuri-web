import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IPrepSession } from "@/api/sessions";
import { PrepSessionForm } from "@/components/prep-session/session/PrepSessionForm.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const CREATED_AT = "2026-01-01T00:00:00.000Z";

const LocationProbe = () => <p>{`path=${useLocation().pathname}`}</p>;

const baseHandlers = () => [
  http.get("*/api/v1/jobs", () =>
    HttpResponse.json({ data: [], message: "OK", statusCode: 200 })
  ),
  http.get("*/api/v1/lookups/roles", () =>
    HttpResponse.json({ data: [], message: "OK", statusCode: 200 })
  ),
  http.get("*/api/v1/lookups/topics", () =>
    HttpResponse.json({ data: [], message: "OK", statusCode: 200 })
  ),
];

describe("PrepSessionForm", () => {
  beforeEach(() => {
    server.use(...baseHandlers());
  });

  afterEach(() => {
    server.resetHandlers();
  });

  const renderForm = () => {
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const view = render(
      <>
        <LocationProbe />
        <PrepSessionForm
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
          open
        />
        <Toaster />
      </>
    );
    return { ...view, onSuccess };
  };

  it("shows a validation error when the title is missing", async () => {
    const { user } = renderForm();

    await user.type(
      screen.getByLabelText("Description"),
      "Frontend interview prep for a Senior React role"
    );
    await user.click(screen.getByRole("button", { name: "Create session" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
  });

  it("creates a session, posts the payload, and opens the detail page", async () => {
    let posted: unknown = null;
    server.use(
      http.post("*/api/v1/prep-session", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        posted = body;
        return HttpResponse.json(
          {
            data: {
              ...body,
              createdAt: CREATED_AT,
              id: "sess-1",
              updatedAt: CREATED_AT,
              userId: "user-1",
            },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    const { user, onSuccess } = renderForm();

    await user.type(screen.getByLabelText("Title"), "React Hooks Deep Dive");
    await user.type(
      screen.getByLabelText("Description"),
      "Frontend interview prep for a Senior React role"
    );
    await user.click(screen.getByRole("button", { name: "Create session" }));

    expect(await screen.findByText("Session created")).toBeInTheDocument();
    expect(posted).toMatchObject({
      description: "Frontend interview prep for a Senior React role",
      title: "React Hooks Deep Dive",
    });
    expect(
      await screen.findByText("path=/sessions/sess-1")
    ).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("updates an existing session through PATCH", async () => {
    const session: IPrepSession = {
      createdAt: CREATED_AT,
      description: "React hooks practice",
      id: "sess-1",
      title: "React Hooks",
      updatedAt: CREATED_AT,
    };
    let patched: unknown = null;
    server.use(
      http.patch("*/api/v1/prep-session/:id", async ({ request, params }) => {
        const body = (await request.json()) as Record<string, unknown>;
        patched = { ...body, id: params.id };
        return HttpResponse.json({
          data: {
            ...(patched as object),
            createdAt: CREATED_AT,
            updatedAt: CREATED_AT,
            userId: "user-1",
          },
          message: "OK",
          statusCode: 200,
        });
      })
    );
    const view = render(
      <>
        <LocationProbe />
        <PrepSessionForm
          onOpenChange={vi.fn()}
          onSuccess={vi.fn()}
          open
          session={session}
        />
        <Toaster />
      </>
    );
    const { user } = view;

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "React Hooks Updated");
    await user.click(screen.getByRole("button", { name: "Update session" }));

    expect(await screen.findByText("Session updated")).toBeInTheDocument();
    expect(patched).toMatchObject({
      id: "sess-1",
      title: "React Hooks Updated",
    });
    expect(
      await screen.findByText("path=/sessions/sess-1")
    ).toBeInTheDocument();
  });

  it("shows an error toast when the create request fails", async () => {
    server.use(
      http.post("*/api/v1/prep-session", () =>
        HttpResponse.json(
          { data: null, message: "boom", statusCode: 500 },
          { status: 500 }
        )
      )
    );
    const { user } = renderForm();

    await user.type(screen.getByLabelText("Title"), "Doomed prep");
    await user.click(screen.getByRole("button", { name: "Create session" }));

    expect(
      await screen.findByText("Failed to create session")
    ).toBeInTheDocument();
  });
});
