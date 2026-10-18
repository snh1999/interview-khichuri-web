import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useGenerateProject, useGenerateSketch } from "@/api/portfolio";
import { AiDialog } from "@/components/common/ai/AiDialog.tsx";
import { getAssetImage } from "@/lib/storage/imageStorageDb";
import { generateSafeId } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import { useBuilderStore } from "@/store/useBuilderStore";
import { AiModalEmptyState } from "./ai/AiModalEmptyState";
import { FrameStep } from "./ai/FrameStep";
import { StyleStep } from "./ai/StyleStep";
import { STYLE_PRESETS } from "./ai/stylePresets";
import type { FrameElement, StampElement } from "./types";
import { isElementContainedInFrame } from "./utils/containment";

interface AiTransformModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetFrameId?: string | null;
  /** "new" replaces the project; "append" adds the generated pages to it. */
  mode?: "new" | "append";
}

// Inspiration images live in this browser's IndexedDB (`idb://`); the server
// cannot read those. Inline the resolved data URLs so generation can actually
// see the uploaded image.
const withResolvedInspiration = async (
  frames: FrameElement[]
): Promise<FrameElement[]> =>
  Promise.all(
    frames.map(async (frame) => {
      const url = frame.inspirationImageUrl;
      if (!url?.startsWith("idb://")) {
        return frame;
      }
      const data = await getAssetImage(url.replace("idb://", ""));
      return { ...frame, inspirationImageUrl: data ?? undefined };
    })
  );

export const AiTransformModal: React.FC<AiTransformModalProps> = ({
  isOpen,
  onClose,
  targetFrameId,
  mode = "new",
}) => {
  const updateThemeColors = useSketchBuilderStore((s) => s.updateThemeColors);
  const applyGeneratedDesign = useSketchBuilderStore(
    (s) => s.applyGeneratedDesign
  );
  const setActiveFrameForAi = useSketchBuilderStore(
    (s) => s.setActiveFrameForAi
  );
  const addElement = useSketchBuilderStore((s) => s.addElement);
  const setViewMode = useSketchBuilderStore((s) => s.setViewMode);
  const seedProjectFiles = useBuilderStore((s) => s.seedProjectFiles);
  // A generation can outlive the page: capture the portfolio that started the
  // run so the streamed files land there even if the user opens another one.
  const targetProjectIdRef = useRef<string | null>(null);
  // Account that started the run. Account switching swaps the user-scoped
  // stores, so files streamed/applied after a change must not land under the
  // incoming user (mirrors the guard in the builder sidebar).
  const runUserIdRef = useRef<string | null>(null);
  const streamProjectFiles = useCallback(
    (files: Record<string, string>) => {
      if (useAppStore.getState().userId !== runUserIdRef.current) {
        return;
      }
      seedProjectFiles(files, targetProjectIdRef.current ?? undefined);
    },
    [seedProjectFiles]
  );

  const generateSketch = useGenerateSketch();
  const generateProject = useGenerateProject(streamProjectFiles);
  const skipAiDialog = useAppStore((state) => state.skipAiDialog);

  const currentPortfolio = useCurrentPortfolio();
  const frames = useMemo(
    () =>
      currentPortfolio.elements.filter(
        (el) => el.type === "frame"
      ) as FrameElement[],
    [currentPortfolio.elements]
  );

  const [selectedFrameIds, setSelectedFrameIds] = useState<string[]>(
    targetFrameId ? [targetFrameId] : []
  );
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>("dark-luxury");

  const lastTargetRef = useRef<string | null>(null);
  useEffect(() => {
    if (!targetFrameId) {
      lastTargetRef.current = null;
      return;
    }
    if (
      frames.some((f) => f.id === targetFrameId) &&
      targetFrameId !== lastTargetRef.current
    ) {
      lastTargetRef.current = targetFrameId;
      setSelectedFrameIds([targetFrameId]);
    }
  }, [targetFrameId, frames]);

  const activeFrames = useMemo(
    () => frames.filter((f) => selectedFrameIds.includes(f.id)),
    [frames, selectedFrameIds]
  );

  const toggleFrame = (frameId: string) =>
    setSelectedFrameIds((prev) =>
      prev.includes(frameId)
        ? prev.filter((id) => id !== frameId)
        : [...prev, frameId]
    );
  const selectAllFrames = () => setSelectedFrameIds(frames.map((f) => f.id));
  const clearFrameSelection = () => setSelectedFrameIds([]);

  const frameElements = useMemo(() => {
    if (selectedFrameIds.length === 0) {
      return [];
    }
    return currentPortfolio.elements.filter(
      (el) =>
        selectedFrameIds.includes(el.frameId ?? "") ||
        selectedFrameIds.includes(el.id) ||
        activeFrames.some((f) => isElementContainedInFrame(el, f))
    );
  }, [currentPortfolio.elements, selectedFrameIds, activeFrames]);

  const detectedSections = useMemo(() => {
    const stamps = frameElements.filter(
      (el) => el.type === "stamp"
    ) as StampElement[];
    return Array.from(new Set(stamps.map((s) => s.stampType)));
  }, [frameElements]);

  const fullPrompt = useMemo(
    () =>
      [
        (() => {
          const preset = STYLE_PRESETS.find((p) => p.id === selectedPresetId);
          return preset ? `Style Theme: ${preset.name} - ${preset.vibe}` : "";
        })(),
        activeFrames.some((f) => f.inspirationImageUrl)
          ? "Incorporate moodboard extracted visual hierarchy"
          : "",
      ]
        .filter(Boolean)
        .join(". "),
    [selectedPresetId, activeFrames]
  );

  const handleCreateDefaultFrame = () => {
    const newFrameId = generateSafeId("frame");
    const newFrame: FrameElement = {
      id: newFrameId,
      type: "frame",
      title: "Home Page",
      route: "/",
      isHome: true,
      preset: "desktop",
      x: 80,
      y: 80,
      width: 1040,
      height: 720,
      strokeColor: "#cbd5e1",
      fillColor: "#ffffff",
      strokeWidth: 1,
      opacity: 1,
      zIndex: 1,
      background: "#ffffff",
    };
    addElement(newFrame);
    setSelectedFrameIds([newFrameId]);
    toast.success("Artboard frame created on canvas");
  };

  // No wireframe: skip the sketch entirely and generate the whole project from
  // the prompt, streaming files straight into the Code Builder.
  const runProjectGeneration = async (
    provider: string,
    model?: string,
    instruction?: string
  ) => {
    const portfolioId = currentPortfolio.id;
    targetProjectIdRef.current = portfolioId;
    runUserIdRef.current = useAppStore.getState().userId;
    onClose();
    useBuilderStore.getState().setActivePortfolio(portfolioId);
    setViewMode("preview");

    toast.info("Generating full site from your prompt...");
    try {
      await generateProject.run({
        prompt: fullPrompt,
        provider,
        model,
        instruction,
      });
      toast.success("Project generated successfully in Code Builder!");
    } catch (err: unknown) {
      console.error("[AiTransformModal] Failed to generate project:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not generate the portfolio. Please try again."
      );
    }
  };

  const runGenerate = async (
    provider: string,
    model?: string,
    instruction?: string
  ) => {
    if (activeFrames.length === 0) {
      if (frames.length > 0) {
        toast.error("Please select at least one artboard frame");
        return;
      }
      await runProjectGeneration(provider, model, instruction);
      return;
    }

    try {
      const preset = STYLE_PRESETS.find((p) => p.id === selectedPresetId);
      if (preset) {
        updateThemeColors({
          primaryColor: preset.primary,
          accentColor: preset.accent,
          backgroundColor: preset.bg,
          surfaceColor: preset.surface,
          textColor: preset.textColor,
          fontHeading: preset.font,
        });
      }

      setActiveFrameForAi(selectedFrameIds[0] ?? null);
      const targetId = currentPortfolio.id;
      const { userId } = useAppStore.getState();
      runUserIdRef.current = userId;
      onClose();

      toast.info(
        mode === "append"
          ? "Adding page(s) to your project..."
          : "Generating live design from wireframe..."
      );
      const portfolio = useSketchBuilderStore.getState().getCurrentPortfolio();
      const design = await generateSketch.mutateAsync({
        prompt: fullPrompt,
        frames: await withResolvedInspiration(activeFrames),
        elements: frameElements,
        theme: portfolio.theme,
        provider,
        model,
        instruction,
      });
      if (useAppStore.getState().userId !== userId) {
        toast.info("AI result discarded: the signed-in account changed.");
        return;
      }
      applyGeneratedDesign(design, mode, targetId);
      toast.success("Design generated successfully in Code Builder!");
    } catch (err: unknown) {
      console.error("[AiTransformModal] Failed to generate design:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to synthesize portfolio design. Please try again.";
      toast.error(message);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <AiDialog
      description="Synthesize your wireframe artboards into a multi-page portfolio — or skip the sketch and generate a full site from your prompt"
      executeDisabled={frames.length > 0 && selectedFrameIds.length === 0}
      executeLabel={mode === "append" ? "Add Page" : "Generate Portfolio"}
      hideSkipDialog
      isLoading={generateSketch.isPending || generateProject.isPending}
      onExecute={runGenerate}
      onOpenChange={handleOpenChange}
      open={isOpen}
      showInstruction
      title={
        mode === "append"
          ? "Add Page to Portfolio"
          : "Transform Wireframe to Portfolio Design"
      }
      useSavedDefaults={skipAiDialog}
    >
      <div className="space-y-6">
        {frames.length === 0 ? (
          <AiModalEmptyState onCreateFrame={handleCreateDefaultFrame} />
        ) : (
          <FrameStep
            activeFrames={activeFrames}
            detectedElementCount={frameElements.length}
            detectedSections={detectedSections}
            elements={currentPortfolio.elements}
            frames={frames}
            onClear={clearFrameSelection}
            onSelectAll={selectAllFrames}
            onToggleFrame={toggleFrame}
            selectedFrameIds={selectedFrameIds}
          />
        )}

        <StyleStep
          onSelectPreset={setSelectedPresetId}
          selectedPresetId={selectedPresetId}
        />

        <div className="font-bold text-md text-muted-foreground">
          Model Selection & Instructions
        </div>
      </div>
    </AiDialog>
  );
};
