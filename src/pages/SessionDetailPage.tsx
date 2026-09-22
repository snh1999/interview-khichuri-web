import { useEffect } from "react";
import { useSession } from "@/api/sessions";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { InterviewsSection } from "@/components/interview/InterviewsSection.tsx";
import { QuestionsSection } from "@/components/prep-session/question/QuestionsSection.tsx";
import { SessionInfoSection } from "@/components/prep-session/session/SessionInfoSection.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionId } from "@/hooks/useId.ts";
import { useTabs } from "@/hooks/useTabs.ts";
import { useAppStore } from "@/store/appStore.ts";

const TABS = [
  { key: "questions", label: "Questions" },
  { key: "interviews", label: "Mock interviews" },
  { key: "notes", label: "Notes" },
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
  const { currentTab, handleTabChange } = useTabs("questions");
  const setPageHeader = useAppStore((state) => state.setPageHeader);

  useEffect(() => {
    setPageHeader(session.title);
  }, [session.title, setPageHeader]);

  const handleTabValueChange = (value: string | null) =>
    handleTabChange(String(value));

  return (
    <div className="w-full">
      <Tabs onValueChange={handleTabValueChange} value={currentTab}>
        <TabsList className="bg-card py-0" variant="line">
          {TABS.map((tab) => (
            <TabsTrigger className="min-w-50" key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <SessionInfoSection session={session} />

        <TabsContent value="questions">
          <QuestionsSection
            sectionId={getSectionId("questions")}
            session={session}
          />
        </TabsContent>

        <TabsContent value="interviews">
          <InterviewsSection
            sectionId={getSectionId("interviews")}
            session={session}
          />
        </TabsContent>

        <TabsContent value="notes">Notes</TabsContent>
      </Tabs>
    </div>
  );
};

const SessionDetailSkeleton = () => (
  <div className="w-full">
    <Skeleton className="mb-3 h-8 w-64" />
    <Skeleton className="mb-6 h-5 w-80" />
    <SkeletonCard>
      <Skeleton className="h-48 w-full" />
    </SkeletonCard>
  </div>
);
