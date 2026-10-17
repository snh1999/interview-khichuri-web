import type React from "react";
import { lazy, Suspense, useEffect } from "react";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
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
          {viewMode === "preview" ? (
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
          ) : (
            <div className="flex h-full flex-1 items-center justify-center bg-muted/30 text-muted-foreground">
              <p className="text-sm">Canvas will be added in the next PR.</p>
            </div>
          )}
        </div>
      </div>
    </AppErrorSuspense>
  );
};
