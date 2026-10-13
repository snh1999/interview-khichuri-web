import { screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { ProfessionalInformation } from "@/components/job-profile/sections/professional/ProfessionalInformation.tsx";
import { render } from "@/test/render.tsx";

interface IHarnessProps {
  defaultValues?: { professional: { summary?: string; title?: string } };
}

const Harness = ({ defaultValues }: IHarnessProps) => {
  const form = useForm<TProfileFormData>({ defaultValues });
  return (
    <FormProvider {...form}>
      <ProfessionalInformation hideCombobox sectionId="professional" />
    </FormProvider>
  );
};

describe("ProfessionalInformation", () => {
  it("writes a typed summary into the form", async () => {
    const view = render(<Harness />);
    const summaryField = screen.getByLabelText("Summary");

    expect(summaryField.tagName).toBe("TEXTAREA");
    expect(summaryField).toHaveAttribute("rows", "3");

    await view.user.type(summaryField, "Backend engineer");
    expect(summaryField).toHaveValue("Backend engineer");
  });

  it("keeps an existing summary", () => {
    render(
      <Harness
        defaultValues={{
          professional: { summary: "Ships small diffs", title: "Engineer" },
        }}
      />
    );

    expect(screen.getByLabelText("Summary")).toHaveValue("Ships small diffs");
  });
});
