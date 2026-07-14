import { FilePdfIcon, TrashIcon } from "@phosphor-icons/react";
import type { IResume } from "@/api/profile";
import { Badge } from "@/components/ui/badge.tsx";
import { ActionButton } from "@/components/ui/button/ActionButton.tsx";
import { Button } from "@/components/ui/button.tsx";

interface IProps {
  resume: IResume;
  isSettingPrimary: boolean;
  onView: () => void;
  onSetPrimary: () => void;
  onDelete: () => Promise<void>;
}

export const ResumeListItem = ({
  resume,
  isSettingPrimary,
  onView,
  onSetPrimary,
  onDelete,
}: Readonly<IProps>) => (
  <div className="flex items-center gap-3 rounded-lg border border-muted-foreground/25 p-3">
    <button
      className="flex min-w-0 flex-1 items-center gap-3 text-left"
      onClick={onView}
      type="button"
    >
      <FilePdfIcon className="size-5 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate text-sm hover:underline">
        {resume.name}
      </span>
    </button>
    {resume.isPrimary ? (
      <Badge className="shrink-0 text-muted-foreground" variant="outline">
        Primary
      </Badge>
    ) : (
      <Button
        className="shrink-0"
        disabled={isSettingPrimary}
        onClick={onSetPrimary}
        size="sm"
        type="button"
        variant="outline"
      >
        Set as Primary
      </Button>
    )}
    <ActionButton
      action={async () => {
        try {
          await onDelete();
          return { error: false, message: "Resume deleted" };
        } catch (err) {
          return {
            error: true,
            message:
              err instanceof Error ? err.message : "Failed to delete resume",
          };
        }
      }}
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
