import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  useDeleteResume,
  useResumes,
  useSetPrimaryResume,
} from "@/api/profile/profiles.ts";
import { MAX_RESUMES } from "@/app.constants.ts";
import { AddResume } from "@/components/job-profile/sections/resume/AddResume.tsx";
import { ResumeListItem } from "@/components/job-profile/sections/resume/ResumeListItem.tsx";
import { ViewResume } from "@/components/job-profile/sections/resume/ViewResume.tsx";
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
  const { data: resumes } = useResumes();

  const [viewingResume, setViewingResume] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [open, setOpen] = useState(false);

  const { mutateAsync: deleteResume } = useDeleteResume();
  const { mutate: setPrimary, isPending: isSettingPrimary } =
    useSetPrimaryResume();

  const hasResume = resumes.length > 0;
  const hasQuota = resumes.length < 5;

  return (
    <Card className="px-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Resume</CardTitle>

            <CardDescription>
              {hasResume
                ? `Uploaded ${resumes.length} of ${MAX_RESUMES}.`
                : "Upload a PDF or generate a tailored resume from your profile data."}

              {hasQuota
                ? ""
                : " To upload more you need to delete at least one"}
            </CardDescription>
          </div>
          <CardAction>
            {hasResume ? (
              <Button
                disabled={!hasQuota}
                onClick={() => setOpen(true)}
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
                onDelete={() => deleteResume(resume.id)}
                onSetPrimary={() => setPrimary(resume.id)}
                onView={() =>
                  setViewingResume({ id: resume.id, name: resume.name })
                }
                resume={resume}
              />
            ))}
          </div>
        ) : (
          <AddResume compactTab count={0} onSuccess={() => setOpen(false)} />
        )}

        {viewingResume ? (
          <ViewResume
            onClose={() => setViewingResume(null)}
            resumeId={viewingResume.id}
            resumeName={viewingResume.name}
          />
        ) : null}
      </CardContent>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add resume</DialogTitle>
          </DialogHeader>
          <AddResume count={resumes.length} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
