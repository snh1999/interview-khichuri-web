import { ListIcon, PenIcon, XIcon } from "@phosphor-icons/react";
import { generatePath, useNavigate } from "react-router";
import type { IResume } from "@/api/resumes";
import { RESUME_DETAIL_PAGE, RESUME_EDITOR_PAGE } from "@/app.constants.ts";
import { ViewResumeContent } from "@/components/resume/job-profile/ViewResumeContent.tsx";
import { OpenPDFInNewTab } from "@/components/resume/OpenPDFInNewTab.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DrawLog,
  DrawLogContent,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog.tsx";

interface IProps {
  resume: IResume;
  onClose: () => void;
}

export const ViewResume = ({ resume, onClose }: Readonly<IProps>) => {
  const isGenerated = Boolean(resume.content);
  const navigate = useNavigate();

  const handleReview = () =>
    navigate(generatePath(RESUME_DETAIL_PAGE, { resumeId: resume.id }));

  const handleEdit = () =>
    navigate(generatePath(RESUME_EDITOR_PAGE, { resumeId: resume.id }));

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <DrawLog onOpenChange={handleOpenChange} open>
      <DrawLogContent
        className="flex h-screen flex-col gap-0 p-0 sm:max-w-5xl"
        showCloseButton={true}
      >
        <DrawLogHeader className="flex flex-row items-center justify-between gap-2 px-4 pt-4 pb-0">
          <DrawLogTitle className="truncate text-sm">
            {resume.name}
          </DrawLogTitle>
        </DrawLogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-4">
          <ViewResumeContent resume={resume} />
        </div>

        <DrawLogFooter className="flex flex-row items-center justify-end gap-2 border-border border-t px-4 py-3">
          <Button onClick={onClose} variant="destructive">
            <XIcon />
            Close
          </Button>
          {isGenerated ? (
            <Button onClick={handleEdit} variant="secondary">
              <PenIcon className="size-4" />
              Edit
            </Button>
          ) : (
            <OpenPDFInNewTab resumeId={resume.id} />
          )}
          <Button onClick={handleReview}>
            <ListIcon /> View
          </Button>
        </DrawLogFooter>
      </DrawLogContent>
    </DrawLog>
  );
};
