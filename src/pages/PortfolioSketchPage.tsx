import type React from "react";
import { lazy, Suspense, useEffect } from "react";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { AiTransformModal } from "@/components/portfolio/sketch/AiTransformModal";
import { Canvas } from "@/components/portfolio/sketch/Canvas";
import { LeftSidebar } from "@/components/portfolio/sketch/LeftSidebar";
import { RightSidebar } from "@/components/portfolio/sketch/RightSidebar";
import { SketchNavbar } from "@/components/portfolio/sketch/SketchNavbar";
import { Spinner } from "@/components/ui/spinner";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import { useBuilderStore } from "@/store/useBuilderStore";

const LazyProjectBuilder = lazy(() =>
  import("@/components/portfolio/builder/ProjectBuilder").then((mod) => ({
    default: mod.ProjectBuilder,
  }))
);

export const PortfolioSketchPage: React.FC = () => {
  const viewMode = useSketchBuilderStore((s) => s.viewMode);
  const isSidebarOpen = useSketchBuilderStore((s) => s.isSidebarOpen);
  const isAiModalOpen = useSketchBuilderStore((s) => s.isAiModalOpen);
  const closeAiModal = useSketchBuilderStore((s) => s.closeAiModal);
  const aiModalTargetFrameId = useSketchBuilderStore(
    (s) => s.aiModalTargetFrameId
  );
  const aiModalMode = useSketchBuilderStore((s) => s.aiModalMode);

  // The editor store owns the live canvas draft; the builder store keys its
  // code projects by the same id, so keep them in step here.
  const draftId = useSketchBuilderStore((s) => s.draft?.id);
  const setActivePortfolio = useBuilderStore((s) => s.setActivePortfolio);
  useEffect(() => {
    if (draftId) {
      setActivePortfolio(draftId);
    }
  }, [draftId, setActivePortfolio]);

  return (
    <AppErrorSuspense>
      <div className="flex h-screen w-screen select-none flex-col overflow-hidden bg-background text-foreground">
        <SketchNavbar />

        <div className="relative flex flex-1 overflow-hidden">
          {viewMode === "canvas" && (
            <>
              {isSidebarOpen && <LeftSidebar />}
              <div className="relative h-full flex-1 overflow-hidden">
                <Canvas />
              </div>
              <RightSidebar />
            </>
          )}

          {viewMode === "preview" && (
            <div className="h-full flex-1 overflow-hidden">
              <Suspense
                fallback={
                  <div className="flex h-full w-full items-center justify-center bg-background text-foreground">
                    <Spinner />
                  </div>
                }
              >
                <LazyProjectBuilder />
              </Suspense>
            </div>
          )}
        </div>

        <AiTransformModal
          isOpen={isAiModalOpen}
          mode={aiModalMode}
          onClose={closeAiModal}
          targetFrameId={aiModalTargetFrameId ?? undefined}
        />
      </div>
    </AppErrorSuspense>
  );
};
