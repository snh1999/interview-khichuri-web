import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useIndustries, useRoles, useTopics } from "@/api/lookups";
import { ADMIN_PAGE } from "@/app.constants";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { LookupManager } from "@/components/lookups/LookupManager";
import { LinkButton } from "@/components/ui/button/LinkButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabs } from "@/hooks/useTabs";

const LookupsPage = () => {
  // const { data: hasAccess, isPending } = useGetPermission({
  //   permissions: { user: ["list"] },
  // });
  const { currentTab, handleTabChange } = useTabs("roles");

  // if (!hasAccess && !isPending) {
  //   return <Navigate to={HOMEPAGE} replace />;
  // }

  return (
    <div className="container mx-auto my-6 px-4">
      <LinkButton className="mb-4" path={ADMIN_PAGE}>
        <ArrowLeftIcon className="mr-2 size-4" />
        Back to Admin
      </LinkButton>

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
