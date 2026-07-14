import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { useResumeViewUrl } from "@/api/profile/profiles.ts";
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
  resumeId: string;
  resumeName: string;
  onClose: () => void;
}

export const ViewResume = ({
  resumeId,
  resumeName,
  onClose,
}: Readonly<IProps>) => {
  const { data, isFetching } = useResumeViewUrl(resumeId);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open
    >
      <DialogContent
        className="flex h-screen flex-col gap-0 p-0 sm:max-w-5xl"
        showCloseButton={true}
      >
        <DialogHeader className="flex flex-row items-center justify-between gap-2 px-4 pt-4 pb-0">
          <DialogTitle className="truncate text-sm">{resumeName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 px-4 pt-2 pb-4">
          {isFetching ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <embed
              className="w-full rounded border"
              src={data.url}
              type="application/pdf"
            />
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 border-border border-t px-4 py-3">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          {data?.url ? (
            <Button
              onClick={() => window.open(data.url, "_blank")}
              variant="default"
            >
              <ArrowSquareOutIcon className="size-4" />
              Open in new tab
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
