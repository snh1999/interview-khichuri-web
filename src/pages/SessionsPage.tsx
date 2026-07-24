import { PlusCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useRoles } from "@/api/lookups";
import { useSessions } from "@/api/sessions";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { useViewToggle, ViewToggle } from "@/components/common/ViewToggle.tsx";
import { SessionCardGrid } from "@/components/prep-session/SessionCardGrid.tsx";
import { SessionListRow } from "@/components/prep-session/SessionListRow.tsx";
import { PrepSessionForm } from "@/components/prep-session/session/PrepSessionForm.tsx";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ItemGroup } from "@/components/ui/item.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useLookupMap } from "@/hooks/useLookupMap.ts";

export const SessionsPage = () => (
  <AppErrorSuspense fallback={SessionsPageSkeleton}>
    <SessionsContent />
  </AppErrorSuspense>
);

const SessionsContent = () => {
  const { data: sessions } = useSessions();
  const rolesMap = useLookupMap(useRoles().data);

  const [dialogOpen, setDialogOpen] = useState(false);
  const { currentView } = useViewToggle("grid");

  const roleName = (roleId?: number | null) => rolesMap.get(roleId ?? 0)?.name;

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-semibold text-xl">Sessions</h1>
        <div className="flex items-center gap-2">
          <ViewToggle />
          {/* TODO: add jobs filter */}
          {/* TODO: add topics filter */}
          <Button onClick={() => setDialogOpen(true)} variant="outline">
            <PlusCircleIcon className="size-3" weight="bold" />
            New Session
          </Button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No sessions yet</EmptyTitle>
            <EmptyDescription>
              Create your first preparation session to start practicing
              interview questions.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {currentView === "grid" && sessions.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCardGrid
              jobLabel={roleName(session.roleId)}
              key={session.id}
              session={session}
            />
          ))}
        </div>
      ) : (
        <ItemGroup className="overflow-hidden rounded-md bg-card">
          {sessions.map((session) => (
            <SessionListRow
              jobLabel={roleName(session.roleId)}
              key={session.id}
              session={session}
            />
          ))}
        </ItemGroup>
      )}

      <PrepSessionForm
        onOpenChange={setDialogOpen}
        onSuccess={() => setDialogOpen(false)}
        open={dialogOpen}
      />
    </div>
  );
};

const SessionsPageSkeleton = () => (
  <div className="w-full">
    <div className="mb-6 flex items-center justify-between">
      <Skeleton className="h-8 w-24" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
    <SkeletonCard>
      <Skeleton className="h-32 w-full" />
    </SkeletonCard>
  </div>
);
