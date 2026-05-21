import {
  type ComponentProps,
  type ReactNode,
  useState,
  useTransition,
} from "react";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import { LoadingSwap } from "@/components/ui/loading-swap.tsx";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";

export function ActionButton({
  action,
  requireConfirmation = false,
  dialogDescription = "This action cannot be undone.",
  ...props
}: ComponentProps<typeof Button> & {
  action: () => Promise<{ error: boolean; message?: string }>;
  requireConfirmation?: boolean;
  dialogDescription?: ReactNode;
}) {
  const [isLoading, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function performAction() {
    startTransition(async () => {
      const data = await action();
      setOpen(false);
      if (data.error) {
        toast.error(data.message ?? "Something went wrong");
      } else if (data.message) {
        toast.success(data.message);
      }
    });
  }

  if (requireConfirmation) {
    return (
      <AlertDialog
        open={open}
        onOpenChange={(val) => {
          if (!isLoading) setOpen(val);
        }}
      >
        <AlertDialogTrigger
          render={<Button {...props} />}
          onClick={() => setOpen(true)}
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={performAction}>
              <LoadingSwap isLoading={isLoading}>Yes</LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      {...props}
      disabled={props.disabled ?? isLoading}
      onClick={(e) => {
        performAction();
        props.onClick?.(e);
      }}
    >
      <LoadingSwap
        isLoading={isLoading}
        className="inline-flex items-center gap-2"
      >
        {props.children}
      </LoadingSwap>
    </Button>
  );
}
