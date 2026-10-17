import {
  ArrowSquareOutIcon,
  CopyIcon,
  DotsThreeVerticalIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  useDeletePortfolio,
  useDuplicatePortfolio,
} from "@/api/portfolio/idb.ts";
import { PORTFOLIO_EDITOR_PAGE } from "@/app.constants.ts";
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
import { Badge } from "@/components/ui/badge.tsx";
import { ActionButton } from "@/components/ui/button/ActionButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Label } from "@/components/ui/label";
import type { Portfolio } from "../portfolio/sketch/types";

interface IProps {
  portfolio: Portfolio;
}

export const PortfolioListItem = ({ portfolio }: Readonly<IProps>) => {
  const navigate = useNavigate();
  const deletePortfolio = useDeletePortfolio();
  const duplicatePortfolio = useDuplicatePortfolio();

  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [copyCode, setCopyCode] = useState(false);

  const frameCount = portfolio.elements.filter(
    (e) => e.type === "frame"
  ).length;

  const editorPath = PORTFOLIO_EDITOR_PAGE.replace(
    ":portfolioId",
    portfolio.id
  );

  const handleOpen = () => {
    navigate(editorPath);
  };

  const handleDuplicate = async () => {
    await duplicatePortfolio.mutateAsync({ copyCode, id: portfolio.id });
    setIsDuplicateOpen(false);
    setCopyCode(false);
    toast.success("Portfolio duplicated");
  };

  const handleOpenDuplicate = () => setIsDuplicateOpen(true);
  const handleCopyCodeChange = (checked: boolean) => setCopyCode(checked);

  const handleDelete = async () => {
    await deletePortfolio.mutateAsync(portfolio.id);
    return { error: false, message: "Portfolio deleted" };
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-muted-foreground/25 p-3">
      <button
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={handleOpen}
        type="button"
      >
        <span
          aria-hidden="true"
          className="size-5 shrink-0 rounded-md border border-border"
          style={{ backgroundColor: portfolio.theme.primaryColor }}
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm hover:underline">
            {portfolio.title}
          </span>
          <span className="truncate text-muted-foreground text-xs">
            Edited{" "}
            {new Date(portfolio.updatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </span>
      </button>

      <Badge className="shrink-0 text-muted-foreground" variant="outline">
        {frameCount} {frameCount === 1 ? "frame" : "frames"}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Actions for ${portfolio.title}`}
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
          <DropdownMenuItem onClick={handleOpen}>
            <ArrowSquareOutIcon className="size-4" /> Open in editor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenDuplicate}>
            <CopyIcon className="size-4" /> Duplicate
          </DropdownMenuItem>
          <ActionButton
            action={handleDelete}
            actionLabel="Delete portfolio"
            aria-label={`Delete ${portfolio.title}`}
            className="w-full justify-start text-destructive"
            dialogDescription="This portfolio wireframe will be permanently deleted."
            dialogTitle="Delete this portfolio?"
            requireConfirmation
            type="button"
            variant="destructive"
          >
            <TrashIcon className="size-4" /> Delete
          </ActionButton>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setIsDuplicateOpen} open={isDuplicateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate this portfolio?</AlertDialogTitle>
            <AlertDialogDescription>
              A copy of "{portfolio.title}" will be created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Label
            className="flex cursor-pointer items-center gap-2 text-sm"
            htmlFor={`copy-code-${portfolio.id}`}
          >
            <Checkbox
              checked={copyCode}
              id={`copy-code-${portfolio.id}`}
              onCheckedChange={handleCopyCodeChange}
            />
            <span>Copy the generated code project too</span>
          </Label>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicate}>
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
