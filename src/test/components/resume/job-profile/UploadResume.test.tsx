import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MAX_RESUMES } from "@/app.constants.ts";
import { UploadResume } from "@/components/resume/job-profile/UploadResume.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { render } from "@/test/render.tsx";

const pdf = (name: string, size = 10) =>
  new File([new Uint8Array(size)], name, { type: "application/pdf" });

const pickFile = async (
  user: ReturnType<typeof render>["user"],
  container: HTMLElement,
  file: File
) => {
  const input = container.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;
  await user.upload(input, file);
};

describe("UploadResume", () => {
  it("uploads a valid PDF and hands the file to the parent", async () => {
    const onUpload = vi.fn();
    const { user, container } = render(
      <UploadResume count={1} isUploading={false} onUpload={onUpload} />
    );

    await pickFile(user, container, pdf("resume.pdf"));

    expect(screen.getByText("resume.pdf")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Upload Resume" }));

    expect(onUpload).toHaveBeenCalledWith(
      expect.objectContaining({ name: "resume.pdf" }),
      undefined
    );
  });

  it("rejects a file that is not a PDF", async () => {
    const onUpload = vi.fn();
    const user = userEvent.setup({ applyAccept: false });
    const { container } = render(
      <>
        <UploadResume count={1} isUploading={false} onUpload={onUpload} />
        <Toaster />
      </>
    );

    await pickFile(
      user,
      container,
      new File(["notes"], "notes.txt", { type: "text/plain" })
    );

    expect(
      await screen.findByText("Invalid file type, only PDF files are allowed!")
    ).toBeInTheDocument();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("rejects a PDF larger than 5MB", async () => {
    const onUpload = vi.fn();
    const { user, container } = render(
      <>
        <UploadResume count={1} isUploading={false} onUpload={onUpload} />
        <Toaster />
      </>
    );

    await pickFile(user, container, pdf("huge.pdf", 5 * 1024 * 1024 + 1));

    expect(
      await screen.findByText("File too large, maximum 5MB allowed!")
    ).toBeInTheDocument();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("shows the quota warning once the resume limit is reached", () => {
    const onUpload = vi.fn();
    render(
      <UploadResume
        count={MAX_RESUMES}
        isUploading={false}
        onUpload={onUpload}
      />
    );

    expect(
      screen.getByText(
        `You have already reached the limit of ${MAX_RESUMES} resumes.`
      )
    ).toBeInTheDocument();
  });
});
