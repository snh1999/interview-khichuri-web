import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { NoteFormDialog } from "@/components/notes/NoteFormDialog.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const capturePosts = () => {
  const posted: unknown[] = [];
  server.use(
    http.post("*/api/v1/notes", async ({ request }) => {
      const body = await request.json();
      posted.push(body);
      return HttpResponse.json(
        {
          data: {
            ...(body as object),
            createdAt: new Date().toISOString(),
            id: "note-1",
            isFavorite: false,
            updatedAt: new Date().toISOString(),
            userId: "user-1",
          },
          message: "Created",
          statusCode: 201,
        },
        { status: 201 }
      );
    })
  );
  return posted;
};

const selectType = async (
  user: ReturnType<typeof render>["user"],
  label: string
) => {
  await user.click(screen.getByRole("combobox", { name: "Type" }));
  await user.click(await screen.findByRole("option", { name: label }));
};

describe("NoteFormDialog", () => {
  const onOpenChange = vi.fn();

  it("shows validation errors when submitted empty", async () => {
    const { user } = render(
      <NoteFormDialog onOpenChange={onOpenChange} open />
    );

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Details are required")).toBeInTheDocument();
  });

  it("prefills a question-bank note and posts it", async () => {
    const posted = capturePosts();
    const { user } = render(
      <>
        <NoteFormDialog onOpenChange={onOpenChange} open />
        <Toaster />
      </>
    );

    await selectType(user, "Question Bank");
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Design deep dive");

    await waitFor(() => {
      expect(
        screen.getByLabelText<HTMLTextAreaElement>("Details (Markdown)").value
      ).toContain("## Other ways this question is asked");
    });
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(posted).toHaveLength(1);
      expect(posted[0]).toMatchObject({
        title: "Design deep dive",
        details: expect.stringContaining("## Other ways"),
        jobId: null,
        questionId: null,
      });
    });
    expect(await screen.findByText("Note created")).toBeInTheDocument();
  });

  it("requires a linked job when the note type is job", async () => {
    server.use(
      http.get("*/api/v1/jobs", () =>
        HttpResponse.json({ data: [], message: "OK", statusCode: 200 })
      )
    );
    const { user } = render(
      <NoteFormDialog onOpenChange={onOpenChange} open />
    );
    await user.type(screen.getByLabelText("Title"), "Interview follow-up");
    await user.type(
      screen.getByLabelText("Details (Markdown)"),
      "Talked through the take-home."
    );

    await selectType(user, "Job");
    await user.type(
      screen.getByLabelText("Details (Markdown)"),
      "Talked through the take-home."
    );
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Please select a job")).toBeInTheDocument();
  });
});
