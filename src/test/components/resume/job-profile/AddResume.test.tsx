import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { AddResume } from "@/components/resume/job-profile/AddResume.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const LocationProbe = () => <p>{`path=${useLocation().pathname}`}</p>;

const completeProfile = {
  email: "jane@example.com",
  educations: [
    {
      degree: "bachelor",
      endDate: "2020-05-01",
      id: "edu-1",
      institution: "MIT",
      isCurrent: false,
      startDate: "2016-09-01",
    },
  ],
  firstName: "Jane",
  lastName: "Doe",
  links: [
    { id: "l1", label: "GitHub", url: "https://github.com/jane" },
    { id: "l2", label: "LinkedIn", url: "https://linkedin.com/in/jane" },
  ],
  phone: "+1-555-0100",
  workOverviews: [
    {
      experienceLevel: "senior",
      skills: [{ topicId: 1 }],
      title: "Senior Software Engineer",
      yearsOfExperience: 6,
    },
  ],
};

const baseHandlers = () => [
  http.get("*/api/v1/lookups/topics", () =>
    HttpResponse.json({ data: [], message: "OK", statusCode: 200 })
  ),
];

const onSuccess = () => undefined;

const renderAddResume = () =>
  render(
    <>
      <LocationProbe />
      <AddResume count={1} onSuccess={onSuccess} />
    </>
  );

describe("AddResume", () => {
  it("prompts to complete the profile when required fields are missing", async () => {
    server.use(
      ...baseHandlers(),
      http.get("*/api/v1/profile", () =>
        HttpResponse.json({ data: {}, message: "OK", statusCode: 200 })
      )
    );
    const { user } = renderAddResume();

    await user.click(
      await screen.findByRole("tab", { name: "Create from profile" })
    );

    expect(
      await screen.findByText(
        "Complete your profile to create a resume from it."
      )
    ).toBeInTheDocument();
  });

  it("creates a resume from the profile and opens the editor", async () => {
    let posted: unknown = null;
    server.use(
      ...baseHandlers(),
      http.get("*/api/v1/profile", () =>
        HttpResponse.json({
          data: completeProfile,
          message: "OK",
          statusCode: 200,
        })
      ),
      http.post("*/api/v1/resume/create", async ({ request }) => {
        posted = await request.json();
        return HttpResponse.json(
          {
            data: {
              id: "res-1",
              name: "Frontend Engineer Resume",
              template: "mbzuai",
            },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    const { user } = renderAddResume();

    await user.click(
      await screen.findByRole("tab", { name: "Create from profile" })
    );
    await user.type(
      await screen.findByLabelText("Resume Name"),
      "Frontend Engineer Resume"
    );
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(posted).toMatchObject({
      name: "Frontend Engineer Resume",
      template: "mbzuai",
    });
    expect(
      await screen.findByText("path=/resumes/res-1/edit")
    ).toBeInTheDocument();
  });
});
