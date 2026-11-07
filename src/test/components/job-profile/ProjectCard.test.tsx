import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw/http";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { ProjectCard } from "@/components/job-profile/sections/projects/ProjectCard.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const CREATE_CUSTOM_RE = /Create "Custom"/u;

const onRemove = () => undefined;

const Harness = () => {
  const form = useForm<TProfileFormData>({
    defaultValues: {
      projects: [{ name: "", skillNames: [], skills: [], type: "project" }],
    },
  });

  return (
    <FormProvider {...form}>
      <ProjectCard index={0} onRemove={onRemove} />
    </FormProvider>
  );
};

describe("ProjectCard", () => {
  it("only allows existing project skill lookups", async () => {
    server.use(
      http.get(`${API}/lookups/topics`, () =>
        envelope([{ id: 1, isApproved: true, name: "React" }])
      )
    );
    const view = render(<Harness />);

    await view.user.type(await screen.findByLabelText("Skills"), "Custom");

    expect(screen.queryByText(CREATE_CUSTOM_RE)).not.toBeInTheDocument();
  });
});
