import {
  ActivityIcon,
  ProhibitIcon,
  UserPlusIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router";
import { useAdminHealth, useAdminStats, useAdminUsers } from "@/api/admin";
import { ADMIN_USERS_PAGE } from "@/app.constants.ts";
import { SignupsChart } from "@/components/admin/charts/SignupsChart.tsx";
import { StatCard } from "@/components/admin/charts/StatCard.tsx";
import { UsageChart } from "@/components/admin/charts/UsageChart.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export const AdminOverviewPage = () => (
  <AppErrorSuspense fallback={AdminOverviewSkeleton}>
    <AdminOverviewContent />
  </AppErrorSuspense>
);

const AdminOverviewContent = () => {
  const { data: stats } = useAdminStats();
  const { data: recent } = useAdminUsers({ limit: 5, sort: "createdAt:desc" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading font-semibold text-xl">Admin Overview</h1>
        <HealthBadge />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UsersIcon}
          title="Total users"
          value={stats.users.total}
        />
        <StatCard
          icon={ActivityIcon}
          title="Active sessions"
          value={stats.users.activeSessions}
        />
        <StatCard
          icon={UserPlusIcon}
          title="New (7 days)"
          value={stats.users.new7d}
        />
        <StatCard
          icon={ProhibitIcon}
          title="Banned"
          value={stats.users.banned}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signups</CardTitle>
          <CardDescription>
            New accounts per day, last 30 days (UTC)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupsChart data={stats.signups} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Records across the product</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageChart usage={stats.usage} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent users</CardTitle>
          <CardDescription>Latest 5 accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.users.length === 0 ? (
            <p className="text-muted-foreground text-sm">No users yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.users.map((user) => (
                <li
                  className="flex items-center justify-between gap-4 py-2"
                  key={user.id}
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {user.email}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            className="mt-3 inline-block text-sm underline"
            to={ADMIN_USERS_PAGE}
          >
            View all users
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminOverviewSkeleton = () => (
  <div aria-busy="true" className="flex flex-col gap-6">
    <Skeleton className="h-7 w-40" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((card) => (
        <SkeletonCard compact key={card} noFooter>
          <Skeleton className="h-8 w-20" />
        </SkeletonCard>
      ))}
    </div>
    <SkeletonCard noFooter>
      <Skeleton className="h-64 w-full" />
    </SkeletonCard>
    <span className="sr-only">Loading admin overview…</span>
  </div>
);

const HealthBadge = () => {
  const { data, isPending, isError } = useAdminHealth();

  let variant: "default" | "secondary" | "destructive" = "default";
  let label = data?.status ?? "Unknown";
  if (isError) {
    variant = "destructive";
    label = "Down";
  } else if (isPending) {
    variant = "secondary";
    label = "Checking…";
  }

  return <Badge variant={variant}>Health: {label}</Badge>;
};
