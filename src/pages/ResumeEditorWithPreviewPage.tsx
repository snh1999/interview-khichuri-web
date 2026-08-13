import { zodResolver } from "@hookform/resolvers/zod";
import { PDFViewer } from "@react-pdf/renderer";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useResumeById, useUpdateResume } from "@/api/profile";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { profileFormSchema } from "@/components/job-profile/profile.helpers.ts";
import { mergeIntoFormData } from "@/components/resume/job-profile/resume.helpers.ts";
import { ResumeFormPanel } from "@/components/resume/menu/ResumeFormPanel.tsx";
import {
  ResumeSettingsMenu,
  type ResumeSettingsValue,
} from "@/components/resume/menu/ResumeSettings.tsx";
import { RenderProvider } from "@/components/resume/PDFAdapter.tsx";
import {
  useTemplatePdfSettings,
  useTemplateSections,
} from "@/components/resume/template.helpers.ts";
import {
  resolveTemplateEntry,
  type TTemplateKey,
} from "@/components/resume/template-registry.ts";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

const ResumeEditorContent = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useResumeById(resumeId ?? "");
  const updateResume = useUpdateResume();

  const [settings, setSettings] = useState<ResumeSettingsValue>({
    mode: "web",
    pdfSettings: {},
    templateId: (resume.template as TTemplateKey | null) ?? "mbzuai",
  });

  const [name, setName] = useState(resume.name);

  const form = useForm<TProfileFormData>({
    defaultValues: mergeIntoFormData(resume.content),
    resolver: zodResolver(profileFormSchema),
  });

  const watchedData = form.watch();
  const formDirty = form.formState.isDirty;
  const isSaving = updateResume.isPending;
  const isDirty = formDirty || name !== resume.name;

  const { mode, pdfSettings, templateId } = settings;
  const ResumeComponent = resolveTemplateEntry(templateId).component;
  const sections = useTemplateSections(templateId);
  const effectivePdfSettings = useTemplatePdfSettings(templateId, pdfSettings);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const trimmedName = name.trim();
      await updateResume.mutateAsync({
        content: data,
        id: resumeId ?? "",
        name: trimmedName || undefined,
      });
      form.reset(data, { keepValues: true });
      toast.success("Resume saved successfully");
    } catch {
      toast.error("Failed to save resume");
    }
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setName(e.target.value);
  const handleReset = () => {
    form.reset(mergeIntoFormData(resume.content));
    setName(resume.name);
  };

  if (!resume.content) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">
          This resume doesn't have editable content. It was uploaded as a PDF.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b bg-background px-6 py-3">
        <Label className="text-muted-foreground text-sm" htmlFor="resume-name">
          Name
        </Label>
        <Input
          className="max-w-sm"
          id="resume-name"
          onChange={handleNameChange}
          value={name}
        />
      </header>

      <div className="page-h-scrollbar flex min-h-0 flex-1 gap-4 overflow-x-auto overflow-y-hidden p-4">
        <div className="min-h-0 min-w-90 flex-1">
          <ResumeFormPanel
            form={form}
            isDirty={isDirty}
            isSaving={isSaving}
            onReset={handleReset}
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
      </div>
    </div>
  );
};

export const ResumeEditorWithPreviewPage = () => (
  <AppErrorSuspense>
    <ResumeEditorContent />
  </AppErrorSuspense>
);
