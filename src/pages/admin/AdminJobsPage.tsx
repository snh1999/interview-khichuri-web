import { AllJobsSection } from "@/components/admin/AllJobsSection.tsx";
import { FailedJobsSection } from "@/components/admin/FailedJobsSection.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabs } from "@/hooks/useTabs";

const AdminJobsPage = () => {
  const { currentTab, handleTabChange } = useTabs("all");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-xl font-semibold">Jobs</h1>
        <p className="text-muted-foreground text-sm">
          Inspect every crawled job or review failed crawls and retry them.
        </p>
      </div>

      <AppErrorSuspense fallback={AdminJobsPageSkeleton}>
        <Tabs onValueChange={handleTabChange} value={currentTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value="failed">
            <FailedJobsSection />
          </TabsContent>
          <TabsContent value="all">
            <AllJobsSection />
          </TabsContent>
        </Tabs>
      </AppErrorSuspense>
    </div>
  );
};

const AdminJobsPageSkeleton = () => (
  <SkeletonCard>
    <Skeleton className="h-20 w-full" />
  </SkeletonCard>
);

export default AdminJobsPage;
