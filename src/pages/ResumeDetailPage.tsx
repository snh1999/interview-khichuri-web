import { PenIcon, ReadCvLogoIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { generatePath, useNavigate } from "react-router";
import {
  type TStandaloneCategoryKey,
  useCachedStandaloneReview,
  useGetResumeById,
  useReviewResumeStandalone,
} from "@/api/resumes";
import { RESUME_EDITOR_PAGE, RESUMES_PAGE } from "@/app.constants.ts";
import { AiActionButton } from "@/components/common/ai/AiActionButton";
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
import { CircularProgress } from "@/components/ui/custom/CircularProgress.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumeId } from "@/hooks/useId.ts";
import { useAppStore } from "@/store/appStore.ts";

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
  const isGenerated = Boolean(resume?.template);
  const hasPdfFile = Boolean(resume?.url);
  const setPageHeader = useAppStore((state) => state.setPageHeader);

  useEffect(() => {
    setPageHeader(resume.name);
  }, [resume.name, setPageHeader]);

  const { data: cachedReviewEntry } = useCachedStandaloneReview(resumeId);
  const cachedReview = cachedReviewEntry ? { ...cachedReviewEntry } : null;
  const reviewMutation = useReviewResumeStandalone();

  const handleExecute = async (provider: string, model?: string) => {
    await reviewMutation.mutateAsync({ resumeId, provider, model });
  };

  const handleNavigateBack = () => navigate(RESUMES_PAGE);
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
          ) : null}
          {hasPdfFile ? <OpenPDFInNewTab resumeId={resumeId} /> : null}
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
              <AiActionButton
                description="A standalone review of your resume across tone & style, content, structure, and skills. Results are cached locally."
                execute={handleExecute}
                executeLabel={cachedReview ? "Re-run" : "Generate Review"}
                isLoading={reviewMutation.isPending}
                size="sm"
                title="AI Resume Review"
                toastErrorMessage="Failed to review resume. Please try again."
                toastSuccessMessage="Resume review complete"
              />
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
