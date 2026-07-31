import { zodResolver } from "@hookform/resolvers/zod";
import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { profileFormSchema } from "@/components/job-profile/profile.helpers.ts";
import { RenderProvider } from "@/components/resume/temp/PDFAdapter.tsx";
import { ResumeFormPanel } from "@/components/resume/temp/ResumeFormPanel.tsx";
import {
  ResumeSettingsMenu,
  type ResumeSettingsValue,
} from "@/components/resume/temp/ResumeSettings.tsx";
import {
  useTemplatePdfSettings,
  useTemplateSections,
} from "@/components/resume/temp/template.helpers.ts";
import { RESUME_ENTRIES } from "@/components/resume/temp/template-registry.ts";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

const defaultContent: TProfileFormData = {
  personal: {
    firstName: "Ahmed",
    lastName: "Al-Farsi",
    email: "ahmed.alfarsi@example.com",
    phone: "+97100000000",
    location: "Abu Dhabi, UAE",
    country: "AE",
    nationality: "Emirati",
  },
  professional: {
    title: "Robotics Researcher",
    summary:
      "Robotics researcher specializing in Vision-Language-Action (VLA) models and robot learning for complex manipulation. I build end-to-end systems across simulation and hardware, with expertise in teleoperation, 3D vision, and collision-aware motion planning.",
    experienceLevel: "mid",
    yearsOfExperience: 3,
    skills: [1, 2, 3, 4, 5, 6, 7, 8],
    industries: [],
  },
  workExperience: [
    {
      company: "Tech Company or Research Lab",
      title: "Robotics Research Intern",
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-08-01"),
      isCurrent: false,
      location: "Abu Dhabi, UAE",
      responsibilities:
        "Engineered a VR-integrated teleoperation suite for industrial manipulators to facilitate large-scale VLA data collection.\nBenchmarked deployment performance of state-of-the-art foundation models on physical hardware.\nInvestigated novel techniques for in-context policy adaptation in unstructured environments.",
    },
    {
      company: "Tech Company",
      title: "Software Engineering Intern",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2024-05-01"),
      isCurrent: false,
      location: "Remote",
      responsibilities:
        "Programmed C# and C++ middleware for automated hardware validation systems.\nOptimized legacy GUI modules, resulting in improved system response times during testing.\nCollaborated with the systems team to integrate firmware updates for semiconductor equipment.",
    },
  ],
  education: [
    {
      degreeName: "MSc in Robotics",
      fieldOfStudy: "Robotics",
      institution: "MBZUAI",
      location: "Abu Dhabi, UAE",
      country: "AE",
      startDate: new Date("2024-01-01"),
      graduationDate: new Date("2026-01-01"),
      notes: "Full academic scholarship\nSupervised by Supervisor Name.",
      gpa: "3.88/4.00",
      coursework: [
        "Visual Object Recognition",
        "Robotic Intelligence",
        "Autonomous Navigation",
      ],
      thesis:
        "Modular Primitives for Multi-Modal Robotic Action Models (In Progress)",
    },
    {
      degreeName: "B.Eng in Electrical and Electronic Engineering",
      fieldOfStudy: "Electrical Engineering",
      institution: "Khalifa University",
      location: "Abu Dhabi, UAE",
      country: "AE",
      startDate: new Date("2019-01-01"),
      graduationDate: new Date("2023-01-01"),
      gpa: "3.92/4.00",
      coursework: [
        "Linear Control Systems",
        "Applied AI",
        "Digital Signal Processing",
      ],
      thesis: "Adaptive Control for Heterogeneous Multi-Agent Systems.",
    },
  ],
  preferences: {},
  links: [
    { type: "linkedin", url: "https://xxx.com/in/yourprofile" },
    { type: "github", url: "https://xxx.com/yourusername" },
    { type: "scholar", url: "https://scholar.google.com/yourprofile" },
  ],
  publications: [
    {
      title:
        "Geometry-Aware VLA Architecture: Infusing 3D Context into Vision-Language-Action Models",
      status: "Under review",
      link: "https://arxiv.org",
      authors: ["Ahmed Al-Farsi", "Co-Author 1", "Co-Author 2", "Co-Author 3"],
    },
    {
      title: "Self-Supervised World Modeling for Robotic Skill Acquisition",
      status: "Under review",
      link: "https://arxiv.org",
      authors: ["Co-Author 1", "Ahmed Al-Farsi", "Co-Author 2"],
    },
    {
      title: "Hybrid Neural Networks for Robust Speech Emotion Classification",
      status: "International Conference on ML",
      authors: ["Ahmed Al-Farsi", "Co-Author 1", "Co-Author 2"],
    },
  ],
  researchProjects: [
    {
      type: "research",
      title: "Autonomous Agricultural Manipulation System",
      date: "2025",
      organization: "University Robotics Lab",
      notes:
        "Developed a point-cloud-based pipeline for object identification and harvesting in occluded scenarios.\nImplemented collision-aware motion planning, reducing accidental contact with obstacles by over 65%.\nIntegrated the system using NVIDIA Isaac Sim and successfully validated on a physical robotic arm.",
      skills: [1, 2, 3, 4, 5],
    },
  ],
  references: [
    {
      name: "Reference Name 1",
      title: "Principal Investigator",
      department: "Department of Robotics",
      institution: "University or Institute Name",
      email: "reference1@example.com",
    },
    {
      name: "Reference Name 2",
      title: "Senior Research Scientist",
      department: "Computer Vision Group",
      institution: "University or Institute Name",
      email: "reference2@example.com",
    },
  ],
};

export function ResumeEditorWithPreviewPage() {
  const [settings, setSettings] = useState<ResumeSettingsValue>({
    templateId: "mbzuai",
    mode: "web",
    pdfSettings: {},
  });

  const { mode, pdfSettings, templateId } = settings;
  const ResumeComponent = RESUME_ENTRIES[templateId].component;
  const sections = useTemplateSections(templateId);
  const effectivePdfSettings = useTemplatePdfSettings(templateId, pdfSettings);

  const pageRef = useRef<HTMLDivElement>(null);
  const [hScroll, setHScroll] = useState({ left: 0, width: 0, client: 0 });

  useEffect(() => {
    const el = pageRef.current;
    if (!el) {
      return;
    }
    const update = () =>
      setHScroll({
        left: el.scrollLeft,
        width: el.scrollWidth,
        client: el.clientWidth,
      });
    update();
    el.addEventListener("scroll", update);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const hasHScroll = hScroll.width > hScroll.client;
  const thumbWidth = hasHScroll ? (hScroll.client / hScroll.width) * 100 : 0;
  const thumbLeft = hasHScroll
    ? (hScroll.left / (hScroll.width - hScroll.client)) * (100 - thumbWidth)
    : 0;

  const form = useForm<TProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultContent,
  });

  const watchedData = form.watch();
  const isDirty = form.formState.isDirty;
  const isSaving = form.formState.isSubmitting;

  const onSubmit = form.handleSubmit((data) => {
    form.reset(data, { keepValues: true });
    toast.success("Preview data updated");
  });

  return (
    <div
      className="page-h-scrollbar fixed inset-0 flex gap-4 overflow-x-auto overflow-y-hidden p-4"
      ref={pageRef}
    >
      <div className="min-h-0 min-w-90 flex-1">
        <ResumeFormPanel
          form={form}
          isDirty={isDirty}
          isSaving={isSaving}
          onReset={() => form.reset(defaultContent)}
          onSubmit={onSubmit}
          templateId={templateId}
        />
      </div>

      <div className="min-h-0 shrink-0">
        <ScrollArea className="h-full">
          <ResumeSettingsMenu
            effective={effectivePdfSettings}
            onChange={setSettings}
            value={settings}
          />

          {mode === "web" && (
            <div className="mt-4">
              <RenderProvider mode="web" settings={effectivePdfSettings}>
                <ResumeComponent data={watchedData} sections={sections} />
              </RenderProvider>
            </div>
          )}

          {mode === "pdf" && (
            <div className="mt-4">
              <PDFViewer height="900px" width="100%">
                <RenderProvider mode="pdf" settings={effectivePdfSettings}>
                  <ResumeComponent data={watchedData} sections={sections} />
                </RenderProvider>
              </PDFViewer>
            </div>
          )}
        </ScrollArea>
      </div>

      {hasHScroll && (
        <div className="pointer-events-none absolute inset-x-4 bottom-1 h-2.5">
          <div
            className="h-full rounded-full bg-muted-foreground/50"
            style={{ width: `${thumbWidth}%`, marginLeft: `${thumbLeft}%` }}
          />
        </div>
      )}
    </div>
  );
}
