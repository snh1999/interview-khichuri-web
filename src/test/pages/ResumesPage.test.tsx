import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { IResume } from "@/api/resumes";
import { Toaster } from "@/components/ui/sonner.tsx";
import { ResumesPage } from "@/pages/ResumesPage.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";
const ACTIONS_FOR = /Actions for Backend Resume/;
const FILL_PROFILE = /Fill profile/;
const SET_PRIMARY = /Set as primary/;
const OPEN_PUBLIC_PAGE = /Open public page/;
const OVERRIDE = /Override/;
const ACCEPT_ALL = /Accept All/;
const APPLY = /Apply/;

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const resume: IResume = {
  content: {
    education: [],
    personal: { firstName: "Grace", lastName: "Hopper" },
    professional: { title: "Engineer" },
    workExperience: [],
  },
  createdAt: "2024-01-01",
  id: "res-1",
  isPrimary: false,
  isPublic: false,
  name: "Backend Resume",
  profileId: "p-1",
  slug: null,
  template: null,
  updatedAt: "2024-01-01",
  url: null,
};

const handlers = (resumes: IResume[] = []) => [
  http.get(`${API}/resume`, () => envelope(resumes)),
  http.get(`${API}/jobs`, () => envelope([])),
  http.get(`${API}/lookups/topics`, () => envelope([])),
  http.get(`${API}/lookups/industries`, () => envelope([])),
];

describe("ResumesPage", () => {
  it("shows the Save control after filling the profile from a resume", async () => {
    server.use(...handlers([resume]));
    const { user } = render(<ResumesPage />);

    await user.click(await screen.findByRole("button", { name: ACTIONS_FOR }));
    await user.click(
      await screen.findByRole("menuitem", { name: FILL_PROFILE })
    );

    await user.click(await screen.findByRole("button", { name: OVERRIDE }));
    const apply = await screen.findByRole("button", { name: APPLY });
    expect(apply).toBeEnabled();
    await user.click(apply);

    expect(
      await screen.findByRole("button", { name: "Save" })
    ).toBeInTheDocument();
  });

  it("resolves resume skill names to existing lookup ids on save", async () => {
    let overviewPayload: unknown = null;
    let projectsPayload: unknown = null;
    let batchCreated = false;
    const lookupResume: IResume = {
      ...resume,
      content: {
        ...resume.content,
        professional: {
          industries: ["Tech"],
          skills: ["React", "Unknown Skill"],
          title: "Engineer",
        },
        projects: [
          {
            name: "Portfolio",
            skills: ["Node", "Another Unknown"],
            type: "project",
          },
        ],
      } as unknown as IResume["content"],
    };

    server.use(
      http.post(`${API}/lookups/topics/batch`, () => {
        batchCreated = true;
        return envelope([]);
      }),
      http.get(`${API}/lookups/topics`, () =>
        envelope([
          { id: 1, isApproved: true, name: "React" },
          { id: 3, isApproved: true, name: "Node" },
        ])
      ),
      http.get(`${API}/lookups/industries`, () =>
        envelope([{ id: 2, isApproved: true, name: "Tech" }])
      ),
      ...handlers([lookupResume]),
      http.put(`${API}/profile`, () => envelope(null)),
      http.put(`${API}/profile/work-overview`, async ({ request }) => {
        overviewPayload = await request.json();
        return envelope(null);
      }),
      http.put(`${API}/profile/projects`, async ({ request }) => {
        projectsPayload = await request.json();
        return envelope(null);
      })
    );
    const { user } = render(
      <>
        <ResumesPage />
        <Toaster />
      </>
    );

    await user.click(await screen.findByRole("button", { name: ACTIONS_FOR }));
    await user.click(
      await screen.findByRole("menuitem", { name: FILL_PROFILE })
    );
    await user.click(await screen.findByRole("button", { name: ACCEPT_ALL }));
    await user.click(await screen.findByRole("button", { name: APPLY }));
    await user.click(await screen.findByRole("button", { name: "Save" }));

    await screen.findByText("Profile saved successfully");
    expect(overviewPayload).toMatchObject({ industries: [2], skills: [1] });
    expect(projectsPayload).toEqual({
      projects: [
        expect.objectContaining({
          name: "Portfolio",
          skills: [3],
        }),
      ],
    });
    expect(batchCreated).toBe(false);
    expect(
      screen.queryByRole("button", { name: "Save" })
    ).not.toBeInTheDocument();
  });

  it("asks for a resume instead of an ATS review when there are none", async () => {
    server.use(...handlers());
    render(<ResumesPage />);

    expect(
      await screen.findByText("Add your first resume")
    ).toBeInTheDocument();
    expect(screen.queryByText("Resume Review")).not.toBeInTheDocument();
  });

  it("sets the selected resume as primary", async () => {
    const primaryIds: string[] = [];
    server.use(
      ...handlers([resume]),
      http.patch(`${API}/resume/:id/primary`, ({ params }) => {
        primaryIds.push(String(params.id));
        return envelope(null);
      })
    );
    const { user } = render(<ResumesPage />);

    await user.click(await screen.findByRole("button", { name: ACTIONS_FOR }));
    await user.click(
      await screen.findByRole("menuitem", { name: SET_PRIMARY })
    );

    expect(primaryIds).toEqual(["res-1"]);
  });

  it("prevents deleting the primary resume while another resume exists", async () => {
    server.use(
      ...handlers([
        { ...resume, isPrimary: true },
        { ...resume, id: "res-2", name: "Frontend Resume" },
      ])
    );
    const { user } = render(<ResumesPage />);

    await user.click(await screen.findByRole("button", { name: ACTIONS_FOR }));

    expect(
      await screen.findByRole("button", {
        name: "Set another resume as primary to Delete",
      })
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("opens the public page of a public resume", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    server.use(
      ...handlers([{ ...resume, isPublic: true, slug: "ada-backend" }])
    );
    const { user } = render(<ResumesPage />);

    await user.click(await screen.findByRole("button", { name: ACTIONS_FOR }));
    await user.click(
      await screen.findByRole("menuitem", { name: OPEN_PUBLIC_PAGE })
    );

    expect(open).toHaveBeenCalledWith(
      `${window.location.origin}/r/ada-backend`,
      "_blank"
    );
    open.mockRestore();
  });
});
