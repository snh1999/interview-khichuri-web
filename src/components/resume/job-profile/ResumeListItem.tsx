import {
  ArrowSquareOutIcon,
  ArticleIcon,
  DotsThreeVerticalIcon,
  FileArrowDownIcon,
  FilePdfIcon,
  LinkIcon,
  PenIcon,
  SparkleIcon,
  StarIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { IResume } from "@/api/resumes";
import { PUBLIC_RESUME_PAGE } from "@/app.constants.ts";
import { AiActionButton } from "@/components/common/ai/AiActionButton.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

interface IProps {
  resume: IResume;
  isExtracting: boolean;
  deleteDisabled?: boolean;
  onView: (resume: IResume) => void;
  onSetPrimary: (id: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  onFillProfile: (
    resume: IResume,
    provider?: string,
    model?: string
  ) => Promise<void>;
}

export const ResumeListItem = ({
  resume,
  isExtracting,
  deleteDisabled = false,
  onView,
  onSetPrimary,
  onDelete,
  onFillProfile,
}: Readonly<IProps>) => {
  const navigate = useNavigate();
  const isGenerated = Boolean(resume.template);
  const isPdf = Boolean(resume.url);
  const publicUrl = resume.slug
    ? `${window.location.origin}${PUBLIC_RESUME_PAGE.replace(":slug", resume.slug)}`
    : null;

  const handleCopyLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      toast.success("Link copied to clipboard");
    }
  };

  const handleOpenPublicPage = () => {
    if (publicUrl) {
      window.open(publicUrl, "_blank");
    }
  };

  const handleNavigate = () => navigate(`/resumes/${resume.id}`);

  const handleNavigateToEdit = () => navigate(`/resumes/${resume.id}/edit`);

  const handleDelete = () => onDelete(resume.id);

  const handleView = () => onView(resume);
  const handleSetPrimary = () => onSetPrimary(resume.id);

  const handleExecute = (provider: string, model?: string) =>
    onFillProfile(resume, provider, model);

  const handleFillProfile = () => onFillProfile(resume);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-muted-foreground/25 p-3">
      <button
        className="flex min-w-0 flex-1 items-center gap-3 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={handleView}
        type="button"
      >
        {isPdf ? (
          <FilePdfIcon className="size-5 shrink-0 text-muted-foreground" />
        ) : (
          <SparkleIcon className="size-5 shrink-0 text-primary" />
        )}
        <span className="flex-1 truncate text-sm hover:underline">
          {resume.name}
        </span>
      </button>

      {resume.isPrimary ? <Badge className="shrink-0">Primary</Badge> : null}

      {isGenerated && resume.template ? (
        <Badge className="shrink-0 text-muted-foreground" variant="outline">
          {resume.template}
        </Badge>
      ) : null}

      {isPdf ? (
        <Badge className="shrink-0 text-muted-foreground" variant="outline">
          PDF
        </Badge>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions for ${resume.name}`}
              className="shrink-0"
              size="icon"
              type="button"
              variant="outline"
            >
              <DotsThreeVerticalIcon className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleNavigate}>
            <ArticleIcon className="size-4" /> Open details
          </DropdownMenuItem>
          {resume.content ? (
            <DropdownMenuItem onClick={handleFillProfile}>
              <FileArrowDownIcon className="size-4" /> Fill profile
            </DropdownMenuItem>
          ) : (
            <AiActionButton
              description="Extract your profile data from this PDF resume. Only sections found in the resume will be updated."
              execute={handleExecute}
              executeLabel="Fill profile"
              hideTarget
              icon={<FileArrowDownIcon className="size-4" />}
              isLoading={isExtracting}
              title="Extract Resume Data"
              toastErrorMessage="Failed to extract resume"
              toastSuccessMessage="Resume data applied to profile. Review and save"
              variant="ghost"
            />
          )}

          <MutationButton
            actionLabel="Set as primary"
            disabled={resume.isPrimary}
            errorMessage="Failed to set primary resume"
            mutationFn={handleSetPrimary}
            renderNode={
              <DropdownMenuItem closeOnClick={false}>
                <StarIcon className="size-4" /> Set as primary
              </DropdownMenuItem>
            }
            successMessage="Primary resume set"
          />
          {isGenerated && (
            <DropdownMenuItem onClick={handleNavigateToEdit}>
              <PenIcon className="size-4" /> Edit
            </DropdownMenuItem>
          )}
          {isGenerated && resume.isPublic && publicUrl ? (
            <DropdownMenuItem onClick={handleCopyLink}>
              <LinkIcon className="size-4" /> Copy link
            </DropdownMenuItem>
          ) : null}
          {resume.isPublic && publicUrl ? (
            <DropdownMenuItem onClick={handleOpenPublicPage}>
              <ArrowSquareOutIcon className="size-4" /> Open public page
            </DropdownMenuItem>
          ) : null}
          <MutationButton
            actionLabel="Delete resume"
            aria-label={`Delete ${resume.name}`}
            dialogDescription={`Deleting "${resume.name}" also removes its saved ATS reviews. This cannot be undone.`}
            dialogTitle="Delete this resume?"
            disabled={Boolean(deleteDisabled)}
            errorMessage="Failed to delete resume"
            mutationFn={handleDelete}
            renderNode={
              <DropdownMenuItem
                closeOnClick={false}
                disabled={deleteDisabled}
                variant="destructive"
              >
                <TrashIcon className="size-4" />{" "}
                {deleteDisabled ? "Set another resume as primary to Delete": "Delete"}
              </DropdownMenuItem>
            }
            requireConfirmation
            successMessage="Resume deleted"
            variant="destructive"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
