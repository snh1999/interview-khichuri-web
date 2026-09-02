import { PenIcon, ReadCvLogoIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { generatePath, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  type TStandaloneCategoryKey,
  useCachedStandaloneReview,
  useGetResumeById,
  useReviewResumeStandalone,
} from "@/api/resumes";
import { RESUME_EDITOR_PAGE, RESUMES_PAGE } from "@/app.constants.ts";
import { AiDialog } from "@/components/common/ai/AiDialog";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { ScoreCard } from "@/components/common/score/ScoreCard";
import { ViewResumeContent } from "@/components/resume/job-profile/ViewResumeContent.tsx";
import { OpenPDFInNewTab } from "@/components/resume/OpenPDFInNewTab.tsx";
import {
  getScoreTone,
  SCORE_TEXT_CLASS,
} from "@/components/resume/resume.helpers.ts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { CircularProgress } from "@/components/ui/custom/circular-progress.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumeId } from "@/hooks/useId.ts";

export const REVIEW_SECTION_LABEL: Record<TStandaloneCategoryKey, string> = {
  toneAndStyle: "Tone & Style",
  content: "Content",
  structure: "Structure",
  skills: "Skills",
};

export const ResumeDetailPage = () => (
  <AppErrorSuspense errorPage fallback={ResumeDetailSkeleton}>
    <ResumeDetailContent />
  </AppErrorSuspense>
);

const ResumeDetailContent = () => {
  const resumeId = useResumeId();
  const navigate = useNavigate();
  const { data: resume } = useGetResumeById(resumeId);
  const isGenerated = Boolean(resume?.content);

  const { data: cachedReviewEntry } = useCachedStandaloneReview(resumeId);
  const cachedReview = cachedReviewEntry ? { ...cachedReviewEntry } : null;
  const [dialogOpen, setDialogOpen] = useState(false);
  const reviewMutation = useReviewResumeStandalone();

  const handleExecute = async (provider: string, model?: string) => {
    try {
      await reviewMutation.mutateAsync({ resumeId, provider, model });
      toast.success("Resume review complete");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to review resume. Please try again.");
    }
  };

  const handleNavigateBack = () => navigate(RESUMES_PAGE);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleEdit = () =>
    navigate(generatePath(RESUME_EDITOR_PAGE, { resumeId }));

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="font-semibold text-xl">{resume.name}</h1>
        <div className="flex items-center gap-2">
          {isGenerated ? (
            <Button onClick={handleEdit} variant="outline">
              <PenIcon className="size-4" />
              Edit
            </Button>
          ) : (
            <OpenPDFInNewTab resumeId={resumeId} />
          )}
          <Button onClick={handleNavigateBack} variant="outline">
            <ReadCvLogoIcon className="size-4" />
            All Resumes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)]">
        <Card className="px-1 pb-1 lg:order-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              {cachedReview ? (
                <CircularProgress
                  className={`shrink-0 ${SCORE_TEXT_CLASS[getScoreTone(cachedReview.overall)]}`}
                  progressBgClassName="text-primary/15"
                  progressClassName="text-primary"
                  showLabel
                  size={60}
                  strokeWidth={7}
                  value={cachedReview.overall}
                />
              ) : null}
              <div>
                <CardTitle className="text-sm">AI Review</CardTitle>
                {cachedReview ? (
                  <CardDescription>
                    Score this resume on — tone, content, structure, and skills.
                  </CardDescription>
                ) : null}
              </div>
            </div>

            <CardAction>
              <Button onClick={handleOpenDialog} size="sm">
                {cachedReview ? "Re-run" : "Generate Review"}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="p-0">
            {cachedReview ? (
              <ScoreCard
                overall={cachedReview.overall}
                sections={cachedReview.categories.map((category) => ({
                  ...category,
                  title: REVIEW_SECTION_LABEL[category.key],
                }))}
                title={resume.name}
              />
            ) : (
              <p className="text-center text-muted-foreground italic">
                Review your resume on its own merits — tone, content, structure,
                and skills. Run a review to get a score and recommendations.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="lg:order-2">
          <ViewResumeContent resume={resume} />
        </div>
      </div>

      <AiDialog
        description="A standalone review of your resume across tone & style, content, structure, and skills. Results are cached locally."
        executeLabel={cachedReview ? "Regenerate Review" : "Generate Review"}
        isLoading={reviewMutation.isPending}
        onExecute={handleExecute}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="AI Resume Review"
      />
    </div>
  );
};

const ResumeDetailSkeleton = () => (
  <div className="w-full">
    <Skeleton className="mb-4 h-8 w-64" />
    <Skeleton className="mb-6 h-5 w-96" />
    <SkeletonCard>
      <Skeleton className="h-96 w-full" />
    </SkeletonCard>
  </div>
);
