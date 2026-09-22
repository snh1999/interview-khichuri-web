import { type ReactNode, useState } from "react";
import { DrawLog } from "@/components/ui/custom/DrawLog.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";

type TDiscardType = "job" | "session" | "note";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDirty: boolean;
  isLoading?: boolean;
  type: TDiscardType;
  isEdit?: boolean;
  children: ReactNode;
}

export const FormDrawLogAlert = ({
  open,
  onOpenChange,
  isDirty,
  isLoading,
  type,
  isEdit,
  children,
}: Readonly<IProps>) => {
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setConfirmDiscardOpen(false);
      onOpenChange(true);
      return;
    }
    if (isDirty && !isLoading) {
      setConfirmDiscardOpen(true);
      return;
    }
    onOpenChange(false);
  };

  const confirmDiscard = () => {
    setConfirmDiscardOpen(false);
    onOpenChange(false);
  };

  return (
    <DrawLog onOpenChange={handleOpenChange} open={open}>
      {children}

      <AlertDialog onOpenChange={setConfirmDiscardOpen} open={confirmDiscardOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              {isEdit
                ? `Your ${type} edits are unsaved. Leave anyway?`
                : `Your new ${type} isn't saved yet. Leave anyway?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard} variant="destructive">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DrawLog>
  );
};
