import { Fragment, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
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
import { useAppStore } from "@/store/appStore.ts";

const PATH_LABELS: Record<string, string> = {
  [HOMEPAGE]: "Home",
  [SETTINGS_PAGE]: "Settings",
  [PROFILE_PAGE]: "Job Profile",
  [ADMIN_PAGE]: "Admin",
  [ADMIN_LOOKUPS_PAGE]: "Lookups",
};

const RESOURCE_SEGMENT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const formatSegment = (segment: string) =>
  segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const HeaderBreadcrumb = () => {
  const { pathname, search } = useLocation();
  const pageHeader = useAppStore((state) => state.pageHeader);
  const setPageHeader = useAppStore((state) => state.setPageHeader);
  const lastResetPath = useRef(pathname);

  useEffect(() => {
    if (lastResetPath.current !== pathname) {
      lastResetPath.current = pathname;
      setPageHeader(null);
    }
  }, [pathname, setPageHeader]);

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((_, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;
    return { path, label: PATH_LABELS[path] ?? formatSegment(segments[index]) };
  });

  const resolvedCrumbs = breadcrumbs.map((crumb, index) => {
    const isResourceCrumb = RESOURCE_SEGMENT_PATTERN.test(segments[index]);
    return isResourceCrumb && pageHeader
      ? { ...crumb, label: pageHeader }
      : crumb;
  });

  const params = new URLSearchParams(search);
  const tabValue = params.get("tab");
  const queryCrumb = tabValue
    ? [{ path: pathname + search, label: formatSegment(tabValue) }]
    : [];

  const allCrumbs = [...resolvedCrumbs, ...queryCrumb];

  if (allCrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        {allCrumbs.map((crumb, index) => (
          <Fragment key={crumb.path}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem className="text-sm">
              {index === allCrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link to={crumb.path} />}>
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
