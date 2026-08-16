import { ArrowSquareOutIcon, PenIcon } from "@phosphor-icons/react";
import { useCallback } from "react";
import { generatePath, useNavigate } from "react-router";
import type { IResume } from "@/api/profile";
import { useResumeViewUrl } from "@/api/profile/profiles.ts";
import { RESUME_EDITOR_PAGE } from "@/app.constants.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

interface IProps {
  resume: IResume;
  onClose: () => void;
}

const PdfResumeView = ({ resume, onClose }: Readonly<IProps>) => {
  const { data, isFetching } = useResumeViewUrl(resume.id);

  const handleOpenInNewTab = useCallback(() => {
    window.open(data?.url, "_blank");
  }, [data?.url]);

  return (
    <>
      <div className="flex flex-1 px-4 pt-2 pb-4">
        {isFetching ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <embed
            className="w-full rounded border"
            src={data?.url}
            type="application/pdf"
          />
        )}
      </div>
      <DialogFooter className="flex flex-row items-center justify-end gap-2 border-border border-t px-4 py-3">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
        {data?.url ? (
          <Button onClick={handleOpenInNewTab} variant="default">
            <ArrowSquareOutIcon className="size-4" />
            Open in new tab
          </Button>
        ) : null}
      </DialogFooter>
    </>
  );
};

const GeneratedResumeView = ({ resume, onClose }: Readonly<IProps>) => {
  const navigate = useNavigate();
  const handleEdit = useCallback(() => {
    navigate(generatePath(RESUME_EDITOR_PAGE, { resumeId: resume.id }));
  }, [navigate, resume.id]);

  return (
    <DialogFooter className="flex flex-row items-center justify-end gap-2 border-border border-t px-4 py-3">
      <Button onClick={onClose} variant="outline">
        Close
      </Button>
      <Button onClick={handleEdit} variant="default">
        <PenIcon className="size-4" />
        Edit
      </Button>
    </DialogFooter>
  );
};

export const ViewResume = ({ resume, onClose }: Readonly<IProps>) => {
  const isGenerated = Boolean(resume.content);
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open>
      <DialogContent
        className="flex h-screen flex-col gap-0 p-0 sm:max-w-5xl"
        showCloseButton={true}
      >
        <DialogHeader className="flex flex-row items-center justify-between gap-2 px-4 pt-4 pb-0">
          <DialogTitle className="truncate text-sm">{resume.name}</DialogTitle>
        </DialogHeader>

        {isGenerated ? (
          <GeneratedResumeView onClose={onClose} resume={resume} />
        ) : (
          <PdfResumeView onClose={onClose} resume={resume} />
        )}
      </DialogContent>
    </Dialog>
  );
};
