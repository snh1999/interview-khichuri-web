import { PlusIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import type React from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useImportPortfolio, usePortfolios } from "@/api/portfolio/idb.ts";
import { PORTFOLIO_EDITOR_PAGE } from "@/app.constants.ts";
import { PortfolioCreateDialog } from "@/components/portfolio/PortfolioCreateDialog.tsx";
import { PortfolioListItem } from "@/components/portfolio/PortfolioListItem.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

export const PortfolioListView = () => {
  const { data: portfolios = [] } = usePortfolios();
  const importPortfolio = useImportPortfolio();
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreateDialog = () => setIsCreateOpen(true);
  const handleImportClick = () => fileInputRef.current?.click();

  const handleCreated = (id: string) =>
    navigate(PORTFOLIO_EDITOR_PAGE.replace(":portfolioId", id));

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!(parsed?.elements && Array.isArray(parsed.elements))) {
          toast.error("Invalid portfolio JSON structure: missing elements");
          return;
        }
        const record = await importPortfolio.mutateAsync(parsed);
        toast.success(`Imported "${parsed.title || "Untitled"}"`);
        navigate(PORTFOLIO_EDITOR_PAGE.replace(":portfolioId", record.id));
      } catch {
        toast.error("Failed to parse portfolio JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="px-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Portfolio (Experiemental)</CardTitle>
            <CardDescription>
              Wireframes and moodboards for your personal portfolio.
            </CardDescription>
            <CardDescription className="text-destructive">
              There may be issues/bugs, Portfolio builder is actively being
              developed.
            </CardDescription>
          </div>
          <CardAction>
            <div className="flex items-center gap-2">
              <input
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportJson}
                ref={fileInputRef}
                type="file"
              />
              <Button onClick={handleImportClick} variant="outline">
                <UploadSimpleIcon className="size-4" />
                Import sketch
              </Button>
              <Button onClick={openCreateDialog} variant="outline">
                <PlusIcon className="size-4" />
                New portfolio
              </Button>
            </div>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {portfolios.length > 0 ? (
          <div className="flex flex-col gap-2">
            {portfolios.map((portfolio) => (
              <PortfolioListItem key={portfolio.id} portfolio={portfolio} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No portfolios yet. Create your first wireframe to get started.
            </p>
            <Button
              className="mt-4"
              onClick={openCreateDialog}
              variant="outline"
            >
              <PlusIcon className="size-4" />
              Create your first portfolio
            </Button>
          </div>
        )}
      </CardContent>

      <PortfolioCreateDialog
        onCreated={handleCreated}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </Card>
  );
};
