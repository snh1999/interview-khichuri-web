import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IJob } from "@/api/jobs";
import { JobPostForm } from "@/components/jobs/JobPostForm.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const CREATED_AT = "2026-01-01T00:00:00.000Z";

const DESCRIPTION = "Senior frontend engineer at a fintech scaleup.";

const editJob: IJob = {
  companyId: 11,
  companyName: "Acme Corp",
  createdAt: CREATED_AT,
  description: DESCRIPTION,
  id: "job-1",
  status: "saved",
  title: "Senior Frontend",
  updatedAt: CREATED_AT,
};

const baseHandlers = () => [
  http.get("*/api/v1/company", () =>
    HttpResponse.json({
      data: [{ id: 11, name: "Acme Corp" }],
      message: "OK",
      statusCode: 200,
    })
  ),
  http.get("*/api/v1/lookups/roles", () =>
    HttpResponse.json({ data: [], message: "OK", statusCode: 200 })
  ),
  http.get("*/api/v1/lookups/topics", () =>
    HttpResponse.json({ data: [], message: "OK", statusCode: 200 })
  ),
];

const pickCompany = async (user: ReturnType<typeof render>["user"]) => {
  const input = screen.getByPlaceholderText("e.g. Acme Corp");
  await user.type(input, "Acme Corp");
  await user.tab();
};

describe("JobPostForm", () => {
  beforeEach(() => {
    server.use(...baseHandlers());
  });

  afterEach(() => {
    server.resetHandlers();
  });

  const renderForm = (job?: IJob) => {
    const view = render(
      <>
        <JobPostForm
          job={job}
          onOpenChange={vi.fn()}
          onSuccess={vi.fn()}
          open
        />
        <Toaster />
      </>
    );
    return view;
  };

  it("shows validation errors when the required fields are missing", async () => {
    const { user } = renderForm();

    await user.type(screen.getByLabelText("Description"), "short");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Title too short")).toBeInTheDocument();
    expect(screen.getByText("Description too short")).toBeInTheDocument();
  });

  it("creates a job with the entered company attached to the payload", async () => {
    let posted: unknown = null;
    server.use(
      http.post("*/api/v1/jobs", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        posted = body;
        return HttpResponse.json(
          {
            data: {
              ...(editJob as object),
              ...body,
              createdAt: CREATED_AT,
              updatedAt: CREATED_AT,
            },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    const { user } = renderForm();

    await user.type(screen.getByLabelText("Description"), DESCRIPTION);
    await user.type(screen.getByLabelText("Title"), "Senior Frontend");
    await pickCompany(user);
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Job created")).toBeInTheDocument();
    expect(posted).toMatchObject({
      companyId: 11,
      companyName: "Acme Corp",
      description: DESCRIPTION,
      status: "saved",
      title: "Senior Frontend",
    });
  });

  it("auto-sets the applied date when the status becomes Applied", async () => {
    let posted: Record<string, unknown> | null = null;
    server.use(
      http.post("*/api/v1/jobs", async ({ request }) => {
        posted = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            data: { ...editJob, createdAt: CREATED_AT, updatedAt: CREATED_AT },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    const { user } = renderForm();

    await user.type(screen.getByLabelText("Description"), DESCRIPTION);
    await user.type(screen.getByLabelText("Title"), "Senior Frontend");
    await pickCompany(user);
    await user.click(screen.getByRole("combobox", { name: "Status" }));
    await user.click(await screen.findByRole("option", { name: "Applied" }));
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Job created")).toBeInTheDocument();
    expect(posted).toMatchObject({
      status: "applied",
      appliedAt: expect.any(String),
    });
  });

  it("auto-sets the status to Applied when the applied date is set", async () => {
    let posted: Record<string, unknown> | null = null;
    server.use(
      http.post("*/api/v1/jobs", async ({ request }) => {
        posted = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            data: { ...editJob, createdAt: CREATED_AT, updatedAt: CREATED_AT },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    const { user } = renderForm();

    await user.type(screen.getByLabelText("Description"), DESCRIPTION);
    await user.type(screen.getByLabelText("Title"), "Senior Frontend");
    await pickCompany(user);
    await user.type(screen.getByLabelText("Applied At"), "15 January 2026");
    await user.tab();
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Job created")).toBeInTheDocument();
    expect(posted).toMatchObject({
      status: "applied",
      appliedAt: expect.any(String),
    });
  });

  it("auto-sets the status to Scheduled when the interview date is set", async () => {
    let posted: Record<string, unknown> | null = null;
    server.use(
      http.post("*/api/v1/jobs", async ({ request }) => {
        posted = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            data: { ...editJob, createdAt: CREATED_AT, updatedAt: CREATED_AT },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    const { user } = renderForm();

    await user.type(screen.getByLabelText("Description"), DESCRIPTION);
    await user.type(screen.getByLabelText("Title"), "Senior Frontend");
    await pickCompany(user);
    await user.type(screen.getByLabelText("Applied At"), "15 January 2026");
    await user.tab();
    await user.type(screen.getByLabelText("Interview Date"), "20 January 2026");
    await user.tab();
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Job created")).toBeInTheDocument();
    expect(posted).toMatchObject({
      status: "scheduled",
      appliedAt: expect.any(String),
      interviewDate: expect.any(String),
    });
  });

  it("updates an existing job through PATCH", async () => {
    let patched: unknown = null;
    server.use(
      http.patch("*/api/v1/jobs/:id", async ({ request, params }) => {
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
    const { user } = renderForm(editJob);

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Staff Frontend");
    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(await screen.findByText("Job updated")).toBeInTheDocument();
    expect(patched).toMatchObject({
      id: "job-1",
      title: "Staff Frontend",
    });
  });

  it("submits number fields as numbers", async () => {
    let posted: Record<string, unknown> | null = null;
    server.use(
      http.post("*/api/v1/jobs", async ({ request }) => {
        posted = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            data: { ...editJob, createdAt: CREATED_AT, updatedAt: CREATED_AT },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    const { user } = renderForm();

    await user.type(screen.getByLabelText("Description"), DESCRIPTION);
    await user.type(screen.getByLabelText("Title"), "Senior Frontend");
    await pickCompany(user);
    await user.type(screen.getByLabelText("Minimum Salary"), "120000");
    await user.type(screen.getByLabelText("Experience Required (years)"), "5");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Job created")).toBeInTheDocument();
    expect(posted).toMatchObject({
      experienceRequired: 5,
      salaryLower: 120_000,
    });
  });

  it("sends null when a number field is cleared on update", async () => {
    let patched: Record<string, unknown> | null = null;
    server.use(
      http.patch("*/api/v1/jobs/:id", async ({ request }) => {
        patched = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: {
            ...editJob,
            createdAt: CREATED_AT,
            updatedAt: CREATED_AT,
            userId: "user-1",
          },
          message: "OK",
          statusCode: 200,
        });
      })
    );
    const { user } = renderForm({ ...editJob, salaryLower: 90_000 });

    await user.clear(screen.getByLabelText("Minimum Salary"));
    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(await screen.findByText("Job updated")).toBeInTheDocument();
    expect(patched).toMatchObject({ salaryLower: null });
  });
});
