import {
  CheckIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";
import {
  getScoreTone,
  ITEM_TONE_CLASS,
  SCORE_FILL_CLASS,
  SCORE_SUMMARY_CLASS,
  SCORE_TEXT_CLASS,
  type TScoreItemTone,
} from "@/components/resume/resume.helpers.ts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/custom/circular-progress.tsx";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface IScoreItem {
  id: string;
  tone: TScoreItemTone;
  label: string;
  description?: string;
}

export interface IScoreTip {
  type: "good" | "improve";
  tip: string;
  explanation: string;
}

export interface IScoreSection {
  key: string;
  title: string;
  score?: number;
  summary?: string;
  items?: IScoreItem[];
  tips?: IScoreTip[];
  content?: ReactNode;
  badge?: string | number;
}

export interface IScoreCardProps {
  overall: number;
  title: string;
  subtitle?: string;
  sections: IScoreSection[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  defaultOpenSections?: string[];
  size?: "sm" | "lg";
  footer?: ReactNode;
}

const ITEM_ICON: Record<TScoreItemTone, typeof CheckIcon> = {
  good: CheckIcon,
  bad: XCircleIcon,
  warn: WarningIcon,
  info: InfoIcon,
};

const tipsToItems = (tips: IScoreTip[]): IScoreItem[] =>
  tips.map((tip) => ({
    id: tip.tip,
    tone: tip.type === "good" ? "good" : "warn",
    label: tip.tip,
    description: tip.explanation,
  }));

const ScoreItemRow = ({ item }: { item: IScoreItem }) => {
  const Icon = ITEM_ICON[item.tone];
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border p-3.5",
        ITEM_TONE_CLASS[item.tone]
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0" />
        <p className="font-semibold text-sm">{item.label}</p>
      </div>
      {item.description ? (
        <p className="text-foreground/80 text-sm">{item.description}</p>
      ) : null}
    </div>
  );
};

const ScoreDetails = ({
  score,
  summary,
}: {
  score: number;
  summary?: string;
}) => {
  const tone = getScoreTone(score);
  return (
    <div className="space-y-1.5 px-2">
      <div className="flex items-baseline justify-end gap-2">
        <span className={cn("font-semibold text-sm", SCORE_TEXT_CLASS[tone])}>
          {score}
        </span>
      </div>
      <Progress indicatorClassName={SCORE_FILL_CLASS[tone]} value={score} />
      {summary ? (
        <p
          className={cn(
            "rounded-xl border px-3.5 py-3 text-sm",
            SCORE_SUMMARY_CLASS[tone]
          )}
        >
          {summary}
        </p>
      ) : null}
    </div>
  );
};

const ScoreSectionBody = ({ section }: { section: IScoreSection }) => {
  const { content, items, score, summary, tips } = section;
  let resolvedItems = items;
  if (!resolvedItems || resolvedItems.length === 0) {
    resolvedItems = tips && tips.length > 0 ? tipsToItems(tips) : undefined;
  }

  return (
    <div className="flex flex-col gap-3">
      {score === undefined ? null : (
        <ScoreDetails score={score} summary={summary} />
      )}

      {resolvedItems && resolvedItems.length > 0 ? (
        <div className="flex flex-col gap-2">
          {resolvedItems.map((item) => (
            <ScoreItemRow item={item} key={item.id} />
          ))}
        </div>
      ) : null}

      {content}
    </div>
  );
};

const renderOverallLabel = (value: number) => (
  <span
    className={cn(
      "font-semibold text-lg",
      SCORE_TEXT_CLASS[getScoreTone(value)]
    )}
  >
    {value}
  </span>
);

const resolveBadge = (section: IScoreSection): string | number | undefined =>
  section.badge ?? section.tips?.length;

export const ScoreCard = ({
  overall,
  title,
  subtitle,
  sections,
  collapsible = true,
  defaultOpen = true,
  defaultOpenSections,
  size = "sm",
  footer,
}: Readonly<IScoreCardProps>) => {
  const [openSections, setOpenSections] = useState<string[]>(
    () => defaultOpenSections ?? sections.map((s) => s.key)
  );

  const handleExpandAll = () => setOpenSections(sections.map((s) => s.key));

  const handleCollapseAll = () => setOpenSections([]);

  const Body = (
    <div className="space-y-4">
      {sections.length > 1 ? (
        <div className="flex justify-end gap-2">
          <Button onClick={handleExpandAll} size="xs" variant="ghost">
            Expand all
          </Button>
          <Button onClick={handleCollapseAll} size="xs" variant="ghost">
            Collapse all
          </Button>
        </div>
      ) : null}

      <Accordion multiple onValueChange={setOpenSections} value={openSections}>
        {sections.map((section) => (
          <AccordionItem key={section.key} value={section.key}>
            <AccordionTrigger className="gap-3 px-4 py-3 hover:no-underline">
              <span className="flex w-full items-center justify-between gap-3">
                <span className="font-medium text-sm">{section.title}</span>
                {resolveBadge(section) ? (
                  <Badge variant="secondary">{resolveBadge(section)}</Badge>
                ) : null}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-1 pb-4">
              <ScoreSectionBody section={section} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {footer}
    </div>
  );

  if (!collapsible) {
    return Body;
  }

  return (
    <Accordion defaultValue={defaultOpen ? ["main"] : []} multiple>
      <AccordionItem className="border-none" value="main">
        <AccordionTrigger className="gap-3 rounded-xs px-4 py-3.5 hover:no-underline">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="max-w-full truncate font-semibold text-base">
                {title}
              </span>
              {subtitle ? (
                <span className="max-w-full truncate text-muted-foreground text-sm">
                  {subtitle}
                </span>
              ) : null}
            </div>
            <CircularProgress
              className="shrink-0 text-primary"
              progressBgClassName="text-primary/15"
              progressClassName="text-primary"
              renderLabel={renderOverallLabel}
              showLabel
              size={size === "lg" ? 96 : 60}
              strokeWidth={size === "lg" ? 9 : 7}
              value={overall}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">{Body}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
