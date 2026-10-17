import {
  ArrowArcLeftIcon,
  ArrowArcRightIcon,
  CheckIcon,
  CodeIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
  DownloadSimpleIcon,
  HouseIcon,
  LayoutIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  MonitorIcon,
  PencilSimpleIcon,
  PlusIcon,
  SidebarSimpleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import type React from "react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { HOMEPAGE } from "@/app.constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import {
  getActiveProject,
  projectHasFiles,
  useBuilderStore,
} from "@/store/useBuilderStore";
import type { ViewMode } from "./types";

const WHITESPACE_SEPARATOR = /\s+/;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: merged app header with per-tab controls; complexity acceptable at this boundary
export const SketchNavbar: React.FC = () => {
  const patchDraft = useSketchBuilderStore((s) => s.patchDraft);
  const viewMode = useSketchBuilderStore((s) => s.viewMode);
  const setViewMode = useSketchBuilderStore((s) => s.setViewMode);
  const undo = useSketchBuilderStore((s) => s.undo);
  const redo = useSketchBuilderStore((s) => s.redo);
  const canUndo = useSketchBuilderStore((s) => s.history.past.length > 0);
  const canRedo = useSketchBuilderStore((s) => s.history.future.length > 0);
  const setViewport = useSketchBuilderStore((s) => s.setViewport);
  const openAiModal = useSketchBuilderStore((s) => s.openAiModal);
  const selectedElementIds = useSketchBuilderStore((s) => s.selectedElementIds);
  const sketchSidebarOpen = useSketchBuilderStore((s) => s.isSidebarOpen);
  const toggleSketchSidebar = useSketchBuilderStore((s) => s.toggleSidebar);

  const deviceMode = useBuilderStore((s) => getActiveProject(s).deviceMode);
  const setDeviceMode = useBuilderStore((s) => s.setDeviceMode);
  const builderSidebarOpen = useBuilderStore(
    (s) => getActiveProject(s).isSidebarOpen
  );
  const toggleBuilderSidebar = useBuilderStore((s) => s.toggleSidebar);
  const lastSaved = useBuilderStore((s) => getActiveProject(s).lastSaved);
  const exportProject = useBuilderStore((s) => s.exportProject);

  const currentPortfolio = useCurrentPortfolio();
  const portfolioInitials =
    currentPortfolio.title
      .split(WHITESPACE_SEPARATOR)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "IK";
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(currentPortfolio.title);
  const [isReplaceConfirmOpen, setIsReplaceConfirmOpen] = useState(false);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = tempTitle.trim();
    if (next) {
      patchDraft({ title: next });
      toast.success("Portfolio renamed");
    }
    setIsEditingTitle(false);
  };

  const isPreviewTab = viewMode === "preview";
  const sidebarOpen = isPreviewTab ? builderSidebarOpen : sketchSidebarOpen;
  const sidebarToggleLabel = sidebarOpen ? "Hide sidebar" : "Show sidebar";
  const toggleSidebar = isPreviewTab
    ? toggleBuilderSidebar
    : toggleSketchSidebar;

  const handleZoomIn = () => {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
    if (!currentPortfolio?.viewport) {
      return;
    }
    setViewport({
      ...currentPortfolio.viewport,
      zoom: Math.min(2.5, currentPortfolio.viewport.zoom + 0.1),
    });
  };

  const handleZoomOut = () => {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
    if (!currentPortfolio?.viewport) {
      return;
    }
    setViewport({
      ...currentPortfolio.viewport,
      zoom: Math.max(0.3, currentPortfolio.viewport.zoom - 0.1),
    });
  };

  const handleResetZoom = () => {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
    if (!currentPortfolio?.viewport) {
      return;
    }
    setViewport({
      ...currentPortfolio.viewport,
      zoom: 1,
      x: 0,
      y: 0,
    });
  };

  const handleExportJson = () => {
    try {
      const jsonString = JSON.stringify(currentPortfolio, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const blobUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = `${(currentPortfolio.title || "portfolio").toLowerCase().replace(/\s+/g, "-")}-portfolio.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(blobUrl);
      toast.success("Portfolio schema exported as JSON");
    } catch (err) {
      console.warn("[SketchNavbar] Failed to export portfolio JSON:", err);
      toast.error("Failed to export portfolio JSON");
    }
  };
  const handleTempTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTempTitle(e.target.value);
  const handleStartRename = () => {
    setTempTitle(currentPortfolio.title);
    setIsEditingTitle(true);
  };
  const handleViewModeChange = (val: string) => setViewMode(val as ViewMode);
  const handleDesktopMode = () => setDeviceMode("desktop");
  const handleTabletMode = () => setDeviceMode("tablet");
  const handleMobileMode = () => setDeviceMode("mobile");
  const handleExportZip = () => exportProject(currentPortfolio.title);

  // The frame the user is working on is whichever selected element is (or
  // belongs to) a frame; used to seed the transform dialog.
  const resolveTargetFrameId = (): string | undefined => {
    const selectedElements = currentPortfolio.elements.filter((e) =>
      selectedElementIds.includes(e.id)
    );
    const selectedFrame =
      selectedElements.find((e) => e.type === "frame") ||
      selectedElements
        .map((e) =>
          currentPortfolio.elements.find(
            (f) => f.type === "frame" && f.id === e.frameId
          )
        )
        .find(Boolean);
    return selectedFrame ? selectedFrame.id : undefined;
  };

  const handleGeneratePortfolio = () => {
    // Replacing an existing project is destructive, so confirm first; a project
    // with only the empty stub has nothing to lose.
    if (projectHasFiles(getActiveProject(useBuilderStore.getState()))) {
      setIsReplaceConfirmOpen(true);
      return;
    }
    openAiModal(resolveTargetFrameId(), "new");
  };

  const handleAddPage = () => openAiModal(resolveTargetFrameId(), "append");

  const handleConfirmReplace = () => {
    setIsReplaceConfirmOpen(false);
    openAiModal(resolveTargetFrameId(), "new");
  };

  return (
    <header className="relative z-40 flex h-14 select-none items-center justify-between gap-1.5 border-border border-b bg-card/80 px-2.5 backdrop-blur-md sm:gap-3 sm:px-4">
      <div className="flex min-w-0 max-w-[40%] shrink-0 items-center gap-1.5 sm:gap-2.5 md:max-w-[40%]">
        <Tooltip>
          <TooltipTrigger
            render={
              <Link className="shrink-0" to={HOMEPAGE}>
                <Button
                  className="shrink-0 rounded-xl text-muted-foreground hover:text-foreground sm:h-9"
                  size="lg"
                  variant="ghost"
                >
                  <HouseIcon size={20} weight="bold" />
                  <span className="hidden text-xs xl:inline">Home</span>
                </Button>
              </Link>
            }
          />
          <TooltipContent side="bottom">Return to Home</TooltipContent>
        </Tooltip>

        <div className="hidden h-4 w-px shrink-0 bg-border sm:block" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                className="shrink-0 rounded-xl text-muted-foreground hover:text-foreground sm:size-9"
                onClick={toggleSidebar}
                size="icon-lg"
                variant="ghost"
              >
                <SidebarSimpleIcon
                  size={20}
                  weight={sidebarOpen ? "fill" : "regular"}
                />
              </Button>
            }
          />
          <TooltipContent side="bottom">{sidebarToggleLabel}</TooltipContent>
        </Tooltip>

        <div className="hidden h-4 w-px shrink-0 bg-border sm:block" />

        {/* Project name + badge — same across all tabs */}
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary font-bold text-primary-foreground text-xs shadow-sm">
            {portfolioInitials}
          </div>
          {isEditingTitle ? (
            <form className="flex items-center" onSubmit={handleTitleSubmit}>
              <Input
                autoFocus
                className="h-auto w-48 rounded border-primary px-2 py-0.5 font-semibold text-sm"
                onBlur={handleTitleSubmit}
                onChange={handleTempTitleChange}
                value={tempTitle}
              />
            </form>
          ) : (
            <Button
              className="group rounded text-left"
              onClick={handleStartRename}
              title="Click to rename project"
              variant="ghost"
            >
              <span className="max-w-[200px] truncate font-medium text-foreground text-sm">
                {currentPortfolio.title}
              </span>
              <PencilSimpleIcon
                className="text-muted-foreground opacity-0 transition group-hover:opacity-100"
                size={13}
              />
            </Button>
          )}
        </div>

        {/* Code Builder-only: Saved indicator */}
        {isPreviewTab && lastSaved ? (
          <span className="ml-1 hidden items-center gap-1 text-muted-foreground text-xs xl:flex">
            <CheckIcon className="text-emerald-500" size={12} /> Saved{" "}
            {lastSaved}
          </span>
        ) : null}

        {/* Sketch-only: Saved indicator (derived from portfolio.updatedAt) */}
        {!isPreviewTab && currentPortfolio.updatedAt ? (
          <span className="ml-1 hidden items-center gap-1 text-muted-foreground text-xs xl:flex">
            <CheckIcon className="text-emerald-500" size={12} /> Saved{" "}
            {new Date(currentPortfolio.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-center px-1">
        <Tabs
          className="flex items-center"
          onValueChange={handleViewModeChange}
          value={viewMode}
        >
          <TabsList className="h-8 gap-0.5 rounded-xl border border-border/80 bg-muted/70 p-0.5 sm:h-9 sm:gap-1 sm:p-1">
            <TabsTrigger
              className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs sm:gap-1.5 sm:px-3"
              value="canvas"
            >
              <LayoutIcon
                size={14}
                weight={viewMode === "canvas" ? "fill" : "regular"}
              />
              <span className="hidden sm:inline">Canvas</span>
            </TabsTrigger>
            <TabsTrigger
              className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs sm:gap-1.5 sm:px-3"
              value="preview"
            >
              <CodeIcon
                className="text-primary"
                size={14}
                weight={viewMode === "preview" ? "fill" : "regular"}
              />
              <span className="hidden sm:inline">Code Builder</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        {viewMode === "canvas" && (
          <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/40 p-0.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    disabled={!canUndo}
                    onClick={undo}
                    size="icon"
                    variant="ghost"
                  >
                    <ArrowArcLeftIcon size={14} />
                  </Button>
                }
              />
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    disabled={!canRedo}
                    onClick={redo}
                    size="icon"
                    variant="ghost"
                  >
                    <ArrowArcRightIcon size={14} />
                  </Button>
                }
              />
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>
        )}

        {viewMode === "canvas" && (
          <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 px-1.5 py-0.5 text-xs">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={handleZoomOut}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <MagnifyingGlassMinusIcon />
                  </Button>
                }
              />
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <Button
              className="font-mono"
              onClick={handleResetZoom}
              size="xs"
              title="Reset Zoom"
              variant="ghost"
            >
              {Math.round(currentPortfolio.viewport.zoom * 100)}%
            </Button>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button onClick={handleZoomIn} size="icon-sm" variant="ghost">
                    <MagnifyingGlassPlusIcon />
                  </Button>
                }
              />
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </div>
        )}

        {viewMode === "canvas" && (
          <Button
            className="rounded-xl sm:h-9"
            onClick={handleExportJson}
            size="lg"
            variant="outline"
          >
            <DownloadSimpleIcon size={15} />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}

        {isPreviewTab && (
          <>
            <div className="flex rounded-lg border border-border bg-muted p-0.5">
              <Button
                onClick={handleDesktopMode}
                size="icon-sm"
                title="Desktop View (100%)"
                variant={deviceMode === "desktop" ? "secondary" : "ghost"}
              >
                <MonitorIcon
                  weight={deviceMode === "desktop" ? "bold" : "regular"}
                />
              </Button>
              <Button
                onClick={handleTabletMode}
                size="icon-sm"
                title="Tablet View (768px)"
                variant={deviceMode === "tablet" ? "secondary" : "ghost"}
              >
                <DeviceTabletIcon
                  weight={deviceMode === "tablet" ? "bold" : "regular"}
                />
              </Button>
              <Button
                onClick={handleMobileMode}
                size="icon-sm"
                title="Mobile View (375px)"
                variant={deviceMode === "mobile" ? "secondary" : "ghost"}
              >
                <DeviceMobileIcon
                  weight={deviceMode === "mobile" ? "bold" : "regular"}
                />
              </Button>
            </div>

            <Button
              className="rounded-lg border-border bg-card shadow-xs hover:bg-accent"
              onClick={handleExportZip}
              size="sm"
              title="Download complete runnable project as .zip file"
              variant="outline"
            >
              <DownloadSimpleIcon className="text-primary" weight="bold" />
              <span className="hidden sm:inline">Export .zip</span>
              <span className="sm:hidden">.zip</span>
            </Button>
          </>
        )}

        {/* Generation triggers: constant across all tabs, rightmost */}
        <Button
          className="shrink-0 rounded-xl shadow-sm hover:opacity-90 sm:h-9"
          onClick={handleAddPage}
          size="lg"
          title="Append the selected artboard(s) as new page(s)"
          variant="outline"
        >
          <PlusIcon size={14} weight="bold" />
          <span className="hidden sm:inline">Add Page</span>
        </Button>
        <Button
          className="shrink-0 rounded-xl shadow-sm hover:opacity-90 sm:h-9"
          onClick={handleGeneratePortfolio}
          size="lg"
        >
          <SparkleIcon size={14} weight="fill" />
          <span className="hidden sm:inline">Generate Portfolio</span>
        </Button>
      </div>

      <AlertDialog
        onOpenChange={setIsReplaceConfirmOpen}
        open={isReplaceConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace your current project?</AlertDialogTitle>
            <AlertDialogDescription>
              Generating a new portfolio replaces the pages and files you have
              now. This cannot be undone. Use Add Page instead to keep them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReplace}>
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};
