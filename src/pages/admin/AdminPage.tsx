import { Navigate } from "react-router";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { useGetPermission } from "@/api/auth/admin.ts";
import { UsersList } from "@/components/admin/UsersList.tsx";
import { HOMEPAGE } from "@/app.constants";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

const AdminPage = () => {
  const { data: hasAccess, isPending } = useGetPermission({
    permissions: { user: ["list"] },
  });

  if (!hasAccess && !isPending) {
    return <Navigate to={HOMEPAGE} replace />;
  }

  return (
    <div className="container mx-auto my-6 px-4">
      <LinkButton path={HOMEPAGE} className="mb-4">
        <ArrowLeftIcon className="mr-2 size-4" />
        Back to Home
      </LinkButton>
      <AppErrorSuspense Fallback={AdminPageSkeleton}>
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
