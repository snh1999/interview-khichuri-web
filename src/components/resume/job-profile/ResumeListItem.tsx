import {
  ArrowSquareOutIcon,
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
import { Badge } from "@/components/ui/badge.tsx";
import { ActionButton } from "@/components/ui/button/ActionButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

interface IProps {
  resume: IResume;
  isSettingPrimary: boolean;
  onView: (resume: IResume) => void;
  onSetPrimary: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onExtract: (resume: IResume) => void;
  onFillProfile: (resume: IResume) => void;
}

export const ResumeListItem = ({
  resume,
  isSettingPrimary,
  onView,
  onSetPrimary,
  onDelete,
  onExtract,
  onFillProfile,
}: Readonly<IProps>) => {
  const navigate = useNavigate();
  const isGenerated = !!resume.content;

  const handleCopyLink = () => {
    if (resume.slug) {
      const url = `${window.location.origin}${PUBLIC_RESUME_PAGE.replace(":slug", resume.slug)}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const handleNavigate = () => navigate(`/resumes/${resume.id}`);

  const handleNavigateToEdit = () => navigate(`/resumes/${resume.id}/edit`);

  const handleDelete = async () => {
    try {
      await onDelete(resume.id);
      return { error: false, message: "Resume deleted" };
    } catch (err) {
      return {
        error: true,
        message: err instanceof Error ? err.message : "Failed to delete resume",
      };
    }
  };

  const handleView = () => onView(resume);
  const handleSetPrimary = () => onSetPrimary(resume.id);

  const handleExtract = () => onExtract(resume);
  const handleFillProfile = () => onFillProfile(resume);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-muted-foreground/25 p-3">
      <button
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={handleView}
        type="button"
      >
        {isGenerated ? (
          <SparkleIcon className="size-5 shrink-0 text-primary" />
        ) : (
          <FilePdfIcon className="size-5 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 truncate text-sm hover:underline">
          {resume.name}
        </span>
      </button>

      {isGenerated
        ? resume.template && (
            <Badge className="shrink-0 text-muted-foreground" variant="outline">
              {resume.template}
            </Badge>
          )
        : null}

      {!isGenerated && (
        <Badge className="shrink-0 text-muted-foreground" variant="outline">
          PDF
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
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
            <ArrowSquareOutIcon className="size-4" /> Visit
          </DropdownMenuItem>
          {isGenerated ? (
            <DropdownMenuItem onClick={handleFillProfile}>
              <FileArrowDownIcon className="size-4" /> Fill profile
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleExtract}>
              <SparkleIcon className="size-4" /> Extract
            </DropdownMenuItem>
          )}

          {!resume.isPrimary && (
            <DropdownMenuItem
              disabled={isSettingPrimary}
              onClick={handleSetPrimary}
            >
              <StarIcon className="size-4" /> Set as Primary
            </DropdownMenuItem>
          )}
          {isGenerated && (
            <DropdownMenuItem onClick={handleNavigateToEdit}>
              <PenIcon className="size-4" /> Edit
            </DropdownMenuItem>
          )}
          {isGenerated && resume.isPublic && resume.slug ? (
            <DropdownMenuItem onClick={handleCopyLink}>
              <LinkIcon className="size-4" /> Copy link
            </DropdownMenuItem>
          ) : null}
          <ActionButton
            action={handleDelete}
            aria-label={`Delete ${resume.name}`}
            className="w-full justify-start text-destructive"
            dialogDescription="This resume will be permanently deleted."
            requireConfirmation
            type="button"
            variant="ghost"
          >
            <TrashIcon className="size-4" /> Delete
          </ActionButton>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActionButton
        action={handleDelete}
        aria-label={`Delete ${resume.name}`}
        dialogDescription="This resume will be permanently deleted."
        requireConfirmation
        size="icon"
        type="button"
        variant="destructive"
      >
        <TrashIcon className="size-4" />
      </ActionButton>
    </div>
  );
};
