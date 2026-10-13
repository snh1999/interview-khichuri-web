import {
  EnvelopeSimpleIcon,
  FileTextIcon,
  LinkedinLogoIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import {
  type IJob,
  useGenerateCoverLetter,
  useGenerateLinkedInDm,
  useGenerateOutreachEmail,
} from "@/api/jobs";
import type { IResume } from "@/api/resumes";
import { useGetResumes } from "@/api/resumes";
import { AiActionButton } from "@/components/common/ai/AiActionButton.tsx";
import { AiResultDrawLog } from "@/components/common/ai/AiResultDrawLog.tsx";
import { AppCombobox } from "@/components/common/form/combobox/AppCombobox.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Separator } from "../ui/separator";

interface IAiDraft {
  description: string;
  markdown: string;
  title: string;
}

const resumeToOption = (r: IResume) => ({ value: r.id, label: r.name });

export const JobLetterActions = ({ job }: Readonly<{ job: IJob }>) => {
  const { data: resumes = [] } = useGetResumes();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [draft, setDraft] = useState<IAiDraft | null>(null);
  const coverLetter = useGenerateCoverLetter();
  const outreachEmail = useGenerateOutreachEmail();
  const linkedInDm = useGenerateLinkedInDm();

  const handleResumeChange = (value: string | number | null) =>
    setSelectedResumeId(value === null ? null : String(value));

  const handleDraftCoverLetter = async (
    provider: string,
    model?: string,
    instruction?: string
  ) => {
    const result = await coverLetter.mutateAsync({
      id: job.id,
      provider,
      model,
      instruction,
      ...(selectedResumeId ? { resumeId: selectedResumeId } : {}),
    });
    setDraft({
      description: `Draft for ${job.title} @ ${job.companyName}.`,
      markdown: result.markdown,
      title: "Cover Letter",
    });
  };

  const handleDraftOutreachEmail = async (
    provider: string,
    model?: string,
    instruction?: string
  ) => {
    const result = await outreachEmail.mutateAsync({
      id: job.id,
      provider,
      model,
      instruction,
      ...(selectedResumeId ? { resumeId: selectedResumeId } : {}),
    });
    setDraft({
      description: `Draft for ${job.title} @ ${job.companyName}.`,
      markdown: result.markdown,
      title: "Outreach Email",
    });
  };

  const handleDraftLinkedInDm = async (
    provider: string,
    model?: string,
    instruction?: string
  ) => {
    const result = await linkedInDm.mutateAsync({
      id: job.id,
      provider,
      model,
      instruction,
      ...(selectedResumeId ? { resumeId: selectedResumeId } : {}),
    });
    setDraft({
      description: `Draft for ${job.title} @ ${job.companyName}.`,
      markdown: result.markdown,
      title: "LinkedIn DM",
    });
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setDraft(null);
    }
  };

  const resumePicker = (
    <AppCombobox
      data={resumes}
      label="Resume"
      onChange={handleResumeChange}
      placeholder="Primary resume (default)"
      toOption={resumeToOption}
      value={selectedResumeId}
    />
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="sm" variant="outline">
              <SparkleIcon className="size-3" />
              Generate
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56 p-2">
          <div className="flex flex-col gap-1">
            <AiActionButton
              className="w-full hover:bg-primary/30"
              description={`Tailored cover letter for ${job.title} @ ${job.companyName}.`}
              execute={handleDraftCoverLetter}
              executeLabel="Cover Letter"
              hideTarget
              icon={<FileTextIcon />}
              isLoading={coverLetter.isPending}
              showInstruction
              size="sm"
              title="Draft Cover Letter"
              toastSuccessMessage="Cover letter drafted"
              variant="ghost"
            >
              {resumePicker}
            </AiActionButton>

            <Separator />

            <AiActionButton
              className="w-full hover:bg-primary/30"
              description={`Short outreach email for ${job.title} @ ${job.companyName}.`}
              execute={handleDraftOutreachEmail}
              executeLabel="Outreach"
              hideTarget
              icon={<EnvelopeSimpleIcon />}
              isLoading={outreachEmail.isPending}
              showInstruction
              size="sm"
              title="Draft Outreach Email"
              toastSuccessMessage="Outreach email drafted"
              variant="ghost"
            >
              {resumePicker}
            </AiActionButton>

            <Separator />

            <AiActionButton
              className="w-full hover:bg-primary/30"
              description={`Short LinkedIn message for ${job.title} @ ${job.companyName}.`}
              execute={handleDraftLinkedInDm}
              executeLabel="LinkedIn DM"
              hideTarget
              icon={<LinkedinLogoIcon />}
              isLoading={linkedInDm.isPending}
              showInstruction
              size="sm"
              title="Draft LinkedIn DM"
              toastSuccessMessage="LinkedIn DM drafted"
              variant="ghost"
            >
              {resumePicker}
            </AiActionButton>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AiResultDrawLog
        description={draft?.description}
        markdown={draft?.markdown}
        onOpenChange={handleClose}
        open={draft !== null}
        title={draft?.title ?? "AI Draft"}
      />
    </>
  );
};
