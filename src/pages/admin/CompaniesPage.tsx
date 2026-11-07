/** biome-ignore-all lint/performance/noJsxPropsBind: handlers need row data */
import {
  ArrowSquareOutIcon,
  DotsThreeIcon,
  PencilLineIcon,
  PlusIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import Avatar from "boring-avatars";
import { formatDistanceToNow } from "date-fns";
import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  type IAdminCompany,
  useAdminCompanies,
  useCrawlCompany,
  useDeleteCompany,
} from "@/api/admin/companies";
import { JOBS_PAGE } from "@/app.constants.ts";
import { CompanyFormDialog } from "@/components/admin/CompanyFormDialog.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/date";
import { createCompanySearch } from "@/lib/search.ts";
import { isHttpUrl } from "@/lib/utils";

const COLUMN_COUNT = 4;
const ATS_BOARD_ID_PATTERN = /^[a-zA-Z0-9_-]+$/u;

const timeAgo = (date: string | Date | undefined) =>
  date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : "";

const sourceProblem = (company: IAdminCompany): string | null => {
  if (!company.provider) {
    return "Set a provider before crawling";
  }
  if (company.provider === "scrape") {
    return company.careerPageUrl?.trim()
      ? null
      : "Add a career page URL before crawling";
  }
  return ATS_BOARD_ID_PATTERN.test(company.atsBoardId ?? "")
    ? null
    : "Add a valid ATS board id before crawling";
};

export const CompaniesPage = () => {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<IAdminCompany | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IAdminCompany | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data: companies = [], isPending } = useAdminCompanies();
  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();

  const searchIndex = useMemo(
    () => createCompanySearch(companies),
    [companies]
  );
  const deferredSearch = useDeferredValue(search);
  const filteredCompanies = useMemo(() => {
    const query = deferredSearch.trim();
    return query.length === 0
      ? companies
      : searchIndex.search(query).map((result) => result.doc.company);
  }, [companies, searchIndex, deferredSearch]);

  const openCreate = () => {
    setEditCompany(null);
    setFormOpen(true);
  };

  const openEdit = (company: IAdminCompany) => {
    setEditCompany(company);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditCompany(null);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    deleteCompany(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setDeleteError(null);
        toast.success("Company deleted");
      },
      onError: (error) => {
        const details =
          error instanceof ApiError && error.statusCode === 409
            ? (error.details as { trackedUserCount?: number } | null)
            : null;
        setDeleteError(
          details?.trackedUserCount
            ? `${details.trackedUserCount} users track jobs from this company.`
            : error.message
        );
      },
    });
  };

  const renderCompanyRows = () => {
    if (isPending) {
      return (
        <TableRow>
          <TableCell colSpan={COLUMN_COUNT}>Loading companies...</TableCell>
        </TableRow>
      );
    }

    if (filteredCompanies.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={COLUMN_COUNT}>No companies found.</TableCell>
        </TableRow>
      );
    }

    return filteredCompanies.map((company) => (
      <CompanyRow
        company={company}
        key={company.id}
        onDelete={() => {
          setDeleteError(null);
          setDeleteTarget(company);
        }}
        onEdit={() => openEdit(company)}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Companies</h1>
        <p className="text-muted-foreground text-sm">
          Manage companies, providers and crawl settings.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Input
          className="max-w-sm"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search companies"
          value={search}
        />
        <Button onClick={openCreate}>
          <PlusIcon />
          New company
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Last crawl</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>{renderCompanyRows()}</TableBody>
      </Table>

      <CompanyFormDialog
        company={editCompany}
        onOpenChange={handleFormOpenChange}
        open={formOpen}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete company?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} and its untracked jobs will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p className="text-destructive text-xs">{deleteError}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={confirmDelete}
              variant="destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const CompanySource = ({ company }: Readonly<{ company: IAdminCompany }>) => {
  if (!company.provider) {
    return (
      <Badge className="text-muted-foreground" variant="outline">
        None
      </Badge>
    );
  }

  const renderValue = () => {
    if (company.provider !== "scrape") {
      return (
        <span className="font-mono text-xs">{company.atsBoardId ?? "—"}</span>
      );
    }

    if (!(company.careerPageUrl && isHttpUrl(company.careerPageUrl))) {
      return <span className="text-muted-foreground text-xs">No URL</span>;
    }

    return (
      <a
        className="inline-flex max-w-64 items-center gap-1 text-xs underline"
        href={company.careerPageUrl}
        rel="noopener noreferrer"
        target="_blank"
        title={company.careerPageUrl}
      >
        <span className="truncate">{company.careerPageUrl}</span>
        <ArrowSquareOutIcon className="shrink-0" />
      </a>
    );
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Badge className="capitalize" variant="secondary">
        {company.provider}
      </Badge>
      {renderValue()}
    </div>
  );
};
const CompanyRow = ({
  company,
  onDelete,
  onEdit,
}: Readonly<{
  company: IAdminCompany;
  onDelete: () => void;
  onEdit: () => void;
}>) => {
  const navigate = useNavigate();
  const { mutate: crawlCompany, isPending: isCrawling } = useCrawlCompany();
  const problem = sourceProblem(company);

  const crawl = () => {
    const id = toast.loading(`Crawling ${company.name}…`);
    crawlCompany(company.id, {
      onSuccess: () =>
        toast.success(`Crawl finished for ${company.name}`, { id }),
      onError: () => toast.dismiss(id),
    });
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            {company.crawlError ? (
              // TODO: show crawl errors inline in the row instead of tooltip-only.
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="bg-destructive/15 text-destructive flex size-6 items-center justify-center rounded-md" />
                  }
                >
                  <WarningIcon weight="fill" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm break-words">
                  {company.crawlError}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div
                className={`size-6 overflow-hidden rounded-md [&>svg]:block ${
                  company.enabled ? "" : "opacity-40 grayscale"
                }`}
              >
                <Avatar name={company.name} size={24} square variant="marble" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <span className="text-md block">{company.name}</span>
            {company.aliases?.length ? (
              <span className="text-muted-foreground block text-xs">
                {company.aliases.join(", ")}
              </span>
            ) : null}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <CompanySource company={company} />
      </TableCell>

      <TableCell>
        <span
          className="block text-xs"
          title={company.crawledAt ? formatDate(company.crawledAt) : undefined}
        >
          {company.crawledAt ? timeAgo(company.crawledAt) : "Never"}
        </span>
        <span
          className="text-muted-foreground block text-xs"
          title={formatDate(company.createdAt)}
        >
          Added {timeAgo(company.createdAt)}
        </span>
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label={`Actions for ${company.name}`}
                size="icon"
                variant="ghost"
              >
                <DotsThreeIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <PencilLineIcon />
              Edit
            </DropdownMenuItem>
            {problem ? (
              <DropdownMenuItem onClick={onEdit}>
                <WarningIcon />
                Fix source
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              disabled={isCrawling || Boolean(problem)}
              onClick={crawl}
              title={problem ?? undefined}
            >
              Crawl now
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate(`${JOBS_PAGE}?companyId=${company.id}&tab=discover`)
              }
            >
              View jobs
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} variant="destructive">
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
