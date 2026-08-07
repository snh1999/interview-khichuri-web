import { useState } from "react";
import { useSession } from "@/api/sessions";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { QuestionsSection } from "@/components/prep-session/question/QuestionsSection.tsx";
import { PrepSessionForm } from "@/components/prep-session/session/PrepSessionForm.tsx";
import { SessionInfoSection } from "@/components/prep-session/session/SessionInfoSection.tsx";
import { ScrollableTabs } from "@/components/ui/custom/ScrollableTab";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionId } from "@/hooks/useId.ts";

const TABS = [
  { key: "details", label: "Details" },
  { key: "questions", label: "Questions" },
] as const;

type TTabKey = (typeof TABS)[number]["key"];

const getSectionId = (key: TTabKey) => `section-${key}`;

export const SessionDetailPage = () => (
  <AppErrorSuspense errorPage fallback={SessionDetailSkeleton}>
    <SessionDetailContent />
  </AppErrorSuspense>
);

const SessionDetailContent = () => {
  const sessionId = useSessionId();
  const { data: session } = useSession(sessionId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const tabs = TABS.map((tab) => ({
    key: tab.key,
    label: tab.label,
  }));

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between">
        <h1 className="font-semibold text-xl">{session.title}</h1>
        <PrepSessionForm
          onOpenChange={setDialogOpen}
          onSuccess={() => setDialogOpen(false)}
          open={dialogOpen}
          session={session}
          viewTrigger
        />
      </div>

      <ScrollableTabs defaultTab="questions" tabs={tabs} />

      <div className="space-y-4">
        <SessionInfoSection
          sectionId={getSectionId("details")}
          session={session}
        />
        <QuestionsSection
          sectionId={getSectionId("questions")}
          session={session}
        />
      </div>
    </div>
  );
};

const SessionDetailSkeleton = () => (
  <div className="w-full">
    <Skeleton className="mb-4 h-8 w-64" />
    <Skeleton className="mb-6 h-5 w-96" />
    <SkeletonCard>
      <Skeleton className="h-48 w-full" />
    </SkeletonCard>
  </div>
);
