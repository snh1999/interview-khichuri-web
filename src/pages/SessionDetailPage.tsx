import { MicrophoneIcon, QuestionMarkIcon } from "@phosphor-icons/react";
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
  { key: "questions", label: "Questions", icon: QuestionMarkIcon },
  { key: "interviews", label: "Mock interviews", icon: MicrophoneIcon },
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
    <div className="flex w-full flex-col gap-4">
      <SessionInfoSection session={session} />

      <Tabs onValueChange={handleTabValueChange} value={currentTab}>
        <TabsList className="w-full bg-card py-0" variant="line">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              <tab.icon className="size-4" />
              <span className="sr-only sm:not-sr-only">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

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
      </Tabs>
    </div>
  );
};

const SessionDetailSkeleton = () => (
  <div className="w-full">
    <div className="mb-4">
      <SkeletonCard>
        <Skeleton className="h-20 w-full" />
      </SkeletonCard>
    </div>
    <Skeleton className="mb-4 h-8 w-full" />
    <SkeletonCard>
      <Skeleton className="h-64 w-full" />
    </SkeletonCard>
  </div>
);
