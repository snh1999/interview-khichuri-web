import { PlusIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useIndustries, useTopics } from "@/api/lookups";
import { useProfile } from "@/api/profile";
import type { IResume } from "@/api/resumes";
import {
  useDeleteResume,
  useExtractResume,
  useGetResumes,
  useSetPrimaryResume,
} from "@/api/resumes";
import { MAX_RESUMES } from "@/app.constants.ts";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { profileToFormData } from "@/components/job-profile/profile.helpers.ts";
import { AddResume } from "@/components/resume/job-profile/AddResume.tsx";
import { ExtractPreviewDialog } from "@/components/resume/job-profile/preview/ExtractPreviewDialog.tsx";
import { ResumeListItem } from "@/components/resume/job-profile/ResumeListItem.tsx";
import {
  applyExtractedLookupIds,
  collectExtractedLookupNames,
  EMPTY_FORM,
  mergeIntoFormData,
  profileApplySchema,
  type TResumeContent,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { buildLookupNameMap } from "@/lib/utils.ts";

export const ResumeCard = () => {
  const { data: resumes } = useGetResumes();
  const { data: profileData } = useProfile();
  const { reset } = useFormContext<TProfileFormData>();
  const topics = useTopics();
  const industries = useIndustries();
  const topicIdsByName = useMemo(
    () => buildLookupNameMap(topics.data),
    [topics.data]
  );
  const industryIdsByName = useMemo(
    () => buildLookupNameMap(industries.data),
    [industries.data]
  );

  const [viewingResume, setViewingResume] = useState<IResume | null>(null);
  const [open, setOpen] = useState(false);
  const [extraction, setExtraction] = useState<TResumeContent | null>(null);
  const { mutateAsync: deleteResume } = useDeleteResume();
  const { mutateAsync: setPrimary } = useSetPrimaryResume();
  const extractResume = useExtractResume();
  const extractedLookups = collectExtractedLookupNames(extraction);

  const handleExtract = async (
    resume: IResume,
    provider: string,
    model?: string
  ) => {
    const result = await extractResume.mutateAsync({
      id: resume.id,
      provider,
      model,
    });
    setExtraction(result);
  };

  const applyExtraction = (merged: TProfileFormData, override: boolean) => {
    try {
      const withLookups = applyExtractedLookupIds(merged, extractedLookups, {
        industries: industryIdsByName,
        topics: topicIdsByName,
      });
      const parsed = profileApplySchema.parse({
        ...EMPTY_FORM,
        ...withLookups,
      });
      reset(parsed as TProfileFormData, { keepDefaultValues: true });
      setExtraction(null);
      toast.success(
        `Profile ${override ? "replaced" : "merged"} with resume data. Review and save`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load resume data"
      );
    }
  };

  const hasResume = resumes.length > 0;
  const hasQuota = resumes.length < MAX_RESUMES;
  const beforeForm = profileData ? profileToFormData(profileData) : undefined;

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);
  const quotaTooltip = `You have reached the ${MAX_RESUMES}-resume limit. Delete one to add another.`;
  const closeResumeView = () => setViewingResume(null);
  const closeExtraction = () => setExtraction(null);
  const handleMerge = (merged: TProfileFormData) =>
    applyExtraction(merged, false);
  const handleOverride = (merged: TProfileFormData) =>
    applyExtraction(merged, true);

  const renderAddResume = () => {
    if (!hasResume) {
      return null;
    }
    const button = (
      <Button disabled={!hasQuota} onClick={openDialog} variant="outline">
        <PlusIcon className="size-4" />
        Add resume
      </Button>
    );
    if (hasQuota) {
      return button;
    }
    return (
      <Tooltip>
        <TooltipTrigger
          render={<span className="inline-flex">{button}</span>}
        />
        <TooltipContent>{quotaTooltip}</TooltipContent>
      </Tooltip>
    );
  };

  const onFillProfile = async (
    resume: IResume,
    provider?: string,
    model?: string
  ) => {
    if (resume.content) {
      setExtraction(mergeIntoFormData(resume.content));
      return;
    }
    if (provider) {
      await handleExtract(resume, provider, model);
    }
  };

  return (
    <Card className="px-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Your resumes</CardTitle>

            <CardDescription>
              {hasResume
                ? `${resumes.length} of ${MAX_RESUMES} resumes.`
                : "Upload a PDF or generate a tailored resume from your profile data."}

              {hasQuota ? "" : " Delete a resume to add another."}
            </CardDescription>
          </div>
          <CardAction>{renderAddResume()}</CardAction>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {hasResume ? (
          <div className="flex flex-col gap-2">
            {resumes.map((resume) => (
              <ResumeListItem
                isExtracting={extractResume.isPending}
                key={resume.id}
                onDelete={deleteResume}
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
            lookupEntries={extractedLookups}
            onClose={closeExtraction}
            onMerge={handleMerge}
            onOverride={handleOverride}
          />
        ) : null}
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
