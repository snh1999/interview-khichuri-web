import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useProfile } from "@/api/profile";
import type { IResume, TExtractionResult } from "@/api/resumes";
import {
  useDeleteResume,
  useExtractResume,
  useGetResumes,
  useSetPrimaryResume,
} from "@/api/resumes";
import { MAX_RESUMES } from "@/app.constants.ts";
import { AiDialog } from "@/components/common/ai/AiDialog.tsx";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { profileToFormData } from "@/components/job-profile/profile.helpers.ts";
import { AddResume } from "@/components/resume/job-profile/AddResume.tsx";
import { ExtractPreviewDialog } from "@/components/resume/job-profile/preview/ExtractPreviewDialog.tsx";
import { ResumeListItem } from "@/components/resume/job-profile/ResumeListItem.tsx";
import {
  EMPTY_FORM,
  mergeIntoFormData,
  resumeExtractionSchema,
} from "@/components/resume/job-profile/resume.helpers.ts";
import { ViewResume } from "@/components/resume/job-profile/ViewResume.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

export const ResumeCard = () => {
  const { data: resumes } = useGetResumes();
  const { data: profileData } = useProfile();
  const { reset } = useFormContext<TProfileFormData>();

  const [viewingResume, setViewingResume] = useState<IResume | null>(null);
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [extractTarget, setExtractTarget] = useState<IResume | null>(null);
  const [extraction, setExtraction] = useState<TExtractionResult | null>(null);

  const { mutateAsync: deleteResume } = useDeleteResume();
  const { mutate: setPrimary, isPending: isSettingPrimary } =
    useSetPrimaryResume();
  const extractResume = useExtractResume();

  const handleExtract = async (provider: string) => {
    if (!extractTarget) {
      return;
    }
    try {
      const result = await extractResume.mutateAsync({
        id: extractTarget.id,
        provider,
      });
      setExtraction(result);
      setAiOpen(false);
      setExtractTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to extract resume"
      );
    }
  };

  const applyExtraction = (merged: TProfileFormData, override: boolean) => {
    try {
      const parsed = resumeExtractionSchema.parse({ ...EMPTY_FORM, ...merged });
      reset(parsed as TProfileFormData, { keepDefaultValues: true });
      setExtraction(null);
      toast.success(
        override
          ? "Profile replaced — review and save"
          : "Profile merged — review and save"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load resume data"
      );
    }
  };

  const hasResume = resumes.length > 0;
  const hasQuota = resumes.length < 5;
  const beforeForm = profileData ? profileToFormData(profileData) : undefined;

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);
  const closeResumeView = () => setViewingResume(null);
  const closeExtraction = () => setExtraction(null);
  const handleMerge = (merged: TProfileFormData) =>
    applyExtraction(merged, false);
  const handleOverride = (merged: TProfileFormData) =>
    applyExtraction(merged, true);

  const onExtract = (resume: IResume) => {
    setExtractTarget(resume);
    setAiOpen(true);
  };

  const onFillProfile = (resume: IResume) => {
    if (!resume.content) {
      return;
    }
    setExtractTarget(resume);
    setExtraction(mergeIntoFormData(resume.content));
  };

  return (
    <Card className="px-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Resume</CardTitle>

            <CardDescription>
              {hasResume
                ? `${resumes.length} of ${MAX_RESUMES} resumes.`
                : "Upload a PDF or generate a tailored resume from your profile data."}

              {hasQuota ? "" : " To add more you need to delete at least one"}
            </CardDescription>
          </div>
          <CardAction>
            {hasResume ? (
              <Button
                disabled={!hasQuota}
                onClick={openDialog}
                variant="outline"
              >
                <PlusIcon className="size-4" />
                Add resume
              </Button>
            ) : null}
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {hasResume ? (
          <div className="flex flex-col gap-2">
            {resumes.map((resume) => (
              <ResumeListItem
                isSettingPrimary={isSettingPrimary}
                key={resume.id}
                onDelete={deleteResume}
                onExtract={onExtract}
                onFillProfile={onFillProfile}
                onSetPrimary={setPrimary}
                onView={setViewingResume}
                resume={resume}
              />
            ))}
          </div>
        ) : (
          <AddResume count={0} onSuccess={closeDialog} />
        )}

        {viewingResume ? (
          <ViewResume onClose={closeResumeView} resume={viewingResume} />
        ) : null}

        {extraction ? (
          <ExtractPreviewDialog
            before={beforeForm}
            data={extraction}
            onClose={closeExtraction}
            onMerge={handleMerge}
            onOverride={handleOverride}
          />
        ) : null}

        <AiDialog
          description="Extract your profile data from this PDF resume. Only sections found in the resume will be updated."
          executeLabel="Extract"
          isLoading={extractResume.isPending}
          onExecute={handleExtract}
          onOpenChange={setAiOpen}
          open={aiOpen}
          title="Extract Resume Data"
        />
      </CardContent>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add resume</DialogTitle>
          </DialogHeader>
          <AddResume count={resumes.length} onSuccess={closeDialog} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
