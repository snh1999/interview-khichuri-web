import { ArrowLeftIcon, ListMagnifyingGlassIcon } from "@phosphor-icons/react";
import { Link, Navigate } from "react-router";
import { useGetPermission } from "@/api/auth/admin.ts";
import { ADMIN_LOOKUPS_PAGE, HOMEPAGE } from "@/app.constants";
import { UsersList } from "@/components/admin/UsersList.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

const AdminPage = () => {
  const { data: hasAccess, isPending } = useGetPermission({
    permissions: { user: ["list"] },
  });

  if (!(hasAccess || isPending)) {
    return <Navigate replace to={HOMEPAGE} />;
  }

  return (
    <div className="container mx-auto my-6 px-4">
      <LinkButton className="mb-4" path={HOMEPAGE}>
        <ArrowLeftIcon className="mr-2 size-4" />
        Back to Home
      </LinkButton>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">Admin Dashboard</h1>
        <Link to={ADMIN_LOOKUPS_PAGE}>
          <Button size="sm" variant="outline">
            <ListMagnifyingGlassIcon />
            Lookup Management
          </Button>
        </Link>
      </div>
      <AppErrorSuspense fallback={AdminPageSkeleton}>
        <UsersList />
      </AppErrorSuspense>
    </div>
  );
};

export default AdminPage;

const AdminPageSkeleton = () => (
  <SkeletonCard>
    <Skeleton className="h-20 w-full" />
  </SkeletonCard>
);
