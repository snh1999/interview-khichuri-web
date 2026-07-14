import { Fragment } from "react";
import { useLocation } from "react-router";
import {
  ADMIN_LOOKUPS_PAGE,
  ADMIN_PAGE,
  HOMEPAGE,
  PROFILE_PAGE,
  SETTINGS_PAGE,
} from "@/app.constants.ts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx";

const PATH_LABELS: Record<string, string> = {
  [HOMEPAGE]: "Home",
  [SETTINGS_PAGE]: "Settings",
  [PROFILE_PAGE]: "Job Profile",
  [ADMIN_PAGE]: "Admin",
  [ADMIN_LOOKUPS_PAGE]: "Lookups",
};

const formatSegment = (segment: string) =>
  segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const HeaderBreadcrumb = () => {
  const { pathname, search } = useLocation();

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((_, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;
    return { path, label: PATH_LABELS[path] ?? formatSegment(segments[index]) };
  });

  const params = new URLSearchParams(search);
  const tabValue = params.get("tab");
  const queryCrumb = tabValue
    ? [{ path: pathname + search, label: formatSegment(tabValue) }]
    : [];

  const allCrumbs = [...breadcrumbs, ...queryCrumb];

  if (allCrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        {allCrumbs.map((crumb, index) => (
          <Fragment key={crumb.path}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === allCrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.path}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
