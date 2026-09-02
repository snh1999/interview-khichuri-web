import type { TAtsCategoryKey, TAtsScore } from "@/api/resumes";
import {
  type IScoreSection,
  ScoreCard,
} from "@/components/common/score/ScoreCard.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";

const CATEGORY_LABELS: Record<TAtsCategoryKey, string> = {
  skillsMatch: "Skills Match",
  keywordHitRate: "Keyword Hit Rate",
  experienceFit: "Experience Fit",
  roleAlignment: "Role Alignment",
};

interface IResumeReviewCardProps {
  score: TAtsScore;
  companyName?: string;
  jobTitle?: string;
  resumeName?: string;
  isCached?: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const ATSReviewCard = ({
  score,
  companyName,
  jobTitle,
  resumeName,
  isCached = false,
  onRegenerate,
  isRegenerating,
}: Readonly<IResumeReviewCardProps>) => {
  const contextLabel = [jobTitle, companyName].filter(Boolean).join(" @ ");

  const sections: IScoreSection[] = [
    ...score.categories.map((category) => ({
      ...category,
      title: CATEGORY_LABELS[category.key],
    })),
    {
      key: "keywords",
      title: "Keyword Match",
      badge: `${score.matchedKeywords.length} matched`,
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {score.matchedKeywords.length > 0 ? (
              score.matchedKeywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-xs">
                No matched keywords
              </span>
            )}
          </div>
          {score.missingKeywords.length > 0 ? (
            <div className="space-y-2 border-border border-t pt-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-muted-foreground text-xs">
                  Missing
                </h4>
                <span className="text-muted-foreground text-xs">
                  {score.missingKeywords.length} gaps
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {score.missingKeywords.map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "recommendations",
      title: "Recommendations",
      badge: score.recommendations.length || undefined,
      items: score.recommendations.map((recommendation) => ({
        id: recommendation,
        tone: "warn" as const,
        label: recommendation,
      })),
    },
    ...(score.tailoringNotes
      ? [
          {
            key: "tailoring",
            title: "Company Tailoring",
            content: (
              <p className="text-muted-foreground text-sm">
                {score.tailoringNotes}
              </p>
            ),
          },
        ]
      : []),
  ];

  return (
    <ScoreCard
      collapsible
      defaultOpen={false}
      footer={
        onRegenerate ? (
          <div className="flex justify-end border-border border-t pt-4">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-xs">
                {isCached
                  ? "Showing cached summary — regenerate for full details."
                  : "Cached locally — results not stored on the server."}
              </span>
              <Button
                disabled={isRegenerating}
                onClick={onRegenerate}
                size="sm"
                variant="outline"
              >
                {isRegenerating ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
          </div>
        ) : undefined
      }
      overall={score.overall}
      sections={sections}
      size="sm"
      subtitle={contextLabel || undefined}
      title={resumeName ?? "Unnamed resume"}
    />
  );
};
