import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw/http";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { ProfessionalInformation } from "@/components/job-profile/sections/professional/ProfessionalInformation.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const CREATE_CUSTOM_RE = /Create "Custom"/u;
const CREATE_SPACE_RE = /Create "Space"/u;

interface IHarnessProps {
  defaultValues?: { professional: { summary?: string; title?: string } };
  showCombobox?: boolean;
}

const Harness = ({ defaultValues, showCombobox }: IHarnessProps) => {
  const form = useForm<TProfileFormData>({ defaultValues });
  return (
    <FormProvider {...form}>
      <ProfessionalInformation
        hideCombobox={!showCombobox}
        sectionId="professional"
      />
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

  it("only allows existing skill and industry lookups", async () => {
    server.use(
      http.get(`${API}/lookups/topics`, () =>
        envelope([{ id: 1, isApproved: true, name: "React" }])
      ),
      http.get(`${API}/lookups/industries`, () =>
        envelope([{ id: 2, isApproved: true, name: "Software" }])
      )
    );
    const view = render(<Harness showCombobox />);

    await view.user.type(await screen.findByLabelText("Skills"), "Custom");
    expect(screen.queryByText(CREATE_CUSTOM_RE)).not.toBeInTheDocument();

    await view.user.type(await screen.findByLabelText("Industries"), "Space");
    expect(screen.queryByText(CREATE_SPACE_RE)).not.toBeInTheDocument();
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
