import { useIndustries, useRoles, useTopics } from "@/api/lookups";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { LookupManager } from "@/components/lookups/LookupManager";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabs } from "@/hooks/useTabs";

const LookupsPage = () => {
  const { currentTab, handleTabChange } = useTabs("roles");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-semibold text-xl">Lookups</h1>
        <p className="text-muted-foreground text-sm">
          Manage roles, topics, and industries.
        </p>
      </div>

      <AppErrorSuspense fallback={LookupsPageSkeleton}>
        <Tabs onValueChange={handleTabChange} value={currentTab}>
          <TabsList className="mb-6 w-full" variant="line">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="industries">Industries</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <RolesTab />
          </TabsContent>
          <TabsContent value="topics">
            <TopicsTab />
          </TabsContent>
          <TabsContent value="industries">
            <IndustriesTab />
          </TabsContent>
        </Tabs>
      </AppErrorSuspense>
    </div>
  );
};

const RolesTab = () => {
  const { data, isPending } = useRoles();
  return <LookupManager data={data} isPending={isPending} schema="roles" />;
};

const TopicsTab = () => {
  const { data, isPending } = useTopics();
  return <LookupManager data={data} isPending={isPending} schema="topics" />;
};

const IndustriesTab = () => {
  const { data, isPending } = useIndustries();
  return (
    <LookupManager data={data} isPending={isPending} schema="industries" />
  );
};

const LookupsPageSkeleton = () => (
  <SkeletonCard>
    <Skeleton className="h-20 w-full" />
  </SkeletonCard>
);

export default LookupsPage;
