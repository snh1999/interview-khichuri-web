import { useIndustries, useRoles, useTopics } from "@/api/lookups";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { LookupManager } from "@/components/lookups/LookupManager";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabs } from "@/hooks/useTabs";

const AdminLookupsPage = () => {
  const { currentTab, handleTabChange } = useTabs("roles");

  return (
    <div>
      <AppErrorSuspense fallback={LookupsPageSkeleton}>
        <Tabs onValueChange={handleTabChange} value={currentTab}>
          <TabsList className="mb-6 w-full">
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

export default AdminLookupsPage;
