import { useParams } from "react-router";
import { usePublicResume } from "@/api/profile";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { mergeIntoFormData } from "@/components/resume/job-profile/resume.helpers.ts";
import { RenderProvider } from "@/components/resume/PDFAdapter.tsx";
import {
  resolveTemplateEntry,
  type TTemplateKey,
} from "@/components/resume/template-registry.ts";
import { EmptyPage } from "@/pages/EmptyPage.tsx";
import { DEFAULT_SECTION_CONFIGS } from "@/store/resumeStore.ts";

const PublicResumeContent = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: resume } = usePublicResume(slug ?? "");

  if (!resume?.content) {
    return (
      <EmptyPage
        description="This resume is not available or has been made private."
        title="Resume Not Found"
      />
    );
  }

  const templateKey = (resume.template as TTemplateKey | null) ?? "mbzuai";
  const entry = resolveTemplateEntry(templateKey);
  const ResumeComponent = entry.component;
  const sections = entry.config.sections ?? DEFAULT_SECTION_CONFIGS;
  const pdfSettings = entry.config.pdfSettings ?? {};

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-4xl">
        <RenderProvider mode="web" settings={pdfSettings}>
          <ResumeComponent
            data={mergeIntoFormData(resume.content)}
            sections={sections}
          />
        </RenderProvider>
      </div>
    </div>
  );
};

export const PublicResumePage = () => (
  <AppErrorSuspense>
    <PublicResumeContent />
  </AppErrorSuspense>
);
