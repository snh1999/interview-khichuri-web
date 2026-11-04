import { PenIcon, ReadCvLogoIcon } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useMemo } from "react";
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
import { resumeToText } from "@/components/resume/utils.ts";
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
import { standaloneReviewCopyPrompt } from "@/lib/ai/prompts.ts";
import { useAppStore } from "@/store/appStore.ts";

export const REVIEW_SECTION_LABEL: Record<TStandaloneCategoryKey, string> = {
  toneAndStyle: "Tone & Style",
  content: "Content",
  structure: "Structure",
  skills: "Skills",
};

const renderBareScore = (value: number) => value;

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
  const cachedReview = cachedReviewEntry ?? null;
  const isStale = Boolean(
    cachedReview &&
      resume.updatedAt &&
      new Date(resume.updatedAt).getTime() > cachedReview.timestamp
  );
  const reviewMutation = useReviewResumeStandalone();

  const copyPrompt = useMemo(
    () =>
      standaloneReviewCopyPrompt({
        resumeText: resumeToText(resume?.content),
      }),
    [resume?.content]
  );

  const handleExecute = async (
    provider: string,
    model?: string,
    instruction?: string
  ) => {
    await reviewMutation.mutateAsync({
      resumeId,
      provider,
      model,
      instruction,
    });
  };

  const handleNavigateBack = () => navigate(RESUMES_PAGE);
  const handleEdit = () =>
    navigate(generatePath(RESUME_EDITOR_PAGE, { resumeId }));

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <h1 className="min-w-0 truncate font-semibold text-base sm:sr-only">
          {resume.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {isGenerated ? (
            <Button onClick={handleEdit} size="sm" variant="ghost">
              <PenIcon className="size-4" />
              Edit
            </Button>
          ) : null}
          {hasPdfFile ? <OpenPDFInNewTab resumeId={resumeId} /> : null}
          <Button onClick={handleNavigateBack} size="sm" variant="ghost">
            <ReadCvLogoIcon className="size-4" />
            All Resumes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <ViewResumeContent resume={resume} />

        <Card className="px-1 pb-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              {cachedReview ? (
                <CircularProgress
                  aria-label="AI review score"
                  className={`shrink-0 ${SCORE_TEXT_CLASS[getScoreTone(cachedReview.overall)]}`}
                  progressBgClassName="text-primary/15"
                  progressClassName="text-primary"
                  renderLabel={renderBareScore}
                  showLabel
                  size={60}
                  strokeWidth={7}
                  value={cachedReview.overall}
                />
              ) : null}
              <div>
                <CardTitle className="text-base">AI Review</CardTitle>
                {cachedReview ? (
                  <CardDescription>
                    {`Reviewed ${formatDistanceToNow(
                      new Date(cachedReview.timestamp),
                      { addSuffix: true }
                    )}`}
                  </CardDescription>
                ) : null}
                {isStale ? (
                  <p className="text-signal-warning text-xs">
                    Resume edited since this review — re-run to refresh.
                  </p>
                ) : null}
              </div>
            </div>

            <CardAction>
              <AiActionButton
                copyPrompt={copyPrompt}
                description="A standalone review of your resume across tone & style, content, structure, and skills. Results are cached locally."
                execute={handleExecute}
                executeLabel={cachedReview ? "Re-run" : "Generate Review"}
                isLoading={reviewMutation.isPending}
                showInstruction
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
      </div>
    </div>
  );
};

const ResumeDetailSkeleton = () => (
  <div className="w-full">
    <div className="mb-4 flex items-center justify-between gap-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-7 w-64" />
    </div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <SkeletonCard>
        <Skeleton className="h-96 w-full" />
      </SkeletonCard>
      <SkeletonCard noFooter>
        <Skeleton className="h-64 w-full" />
      </SkeletonCard>
    </div>
  </div>
);
