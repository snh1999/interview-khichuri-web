import { useEffect, useState } from "react";
import { generatePath, useNavigate, useSearchParams } from "react-router";
import type { TJobStatus } from "@/api/jobs";
import { JOB_STATUS } from "@/api/jobs";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import {
  DATE_TYPE_SELECTIONS,
  getDatePreset,
  type TJobDatePresetKey,
  type TJobDateTypeSelection,
} from "@/components/jobs/filters/jobDatePresets.ts";
import { usePaste } from "@/hooks/usePaste.ts";
import { isHttpUrl } from "@/lib/utils.ts";
import { useJobsStore } from "@/store/useJobsStore.ts";

export const useNavigateToJob = (jobId: string) => {
  const navigate = useNavigate();
  return () => navigate(generatePath(JOB_DETAIL_PAGE, { jobId }));
};

const isJobStatus = (value: string | null): value is TJobStatus =>
  typeof value === "string" && JOB_STATUS.some((status) => status === value);

const isDateTypeSelection = (
  value: string | null
): value is TJobDateTypeSelection =>
  typeof value === "string" &&
  DATE_TYPE_SELECTIONS.some((type) => type === value);

const isPresetKey = (value: string | null): value is TJobDatePresetKey =>
  getDatePreset(value) !== undefined;

export const parseCompanyIdParam = (value: string | null) => {
  if (value === null) {
    return null;
  }
  const companyId = Number(value);
  return Number.isInteger(companyId) && companyId > 0 ? companyId : null;
};

export const readFiltersFromParams = (params: URLSearchParams) => {
  const { setCompanyId, setStatus, setDateChange } = useJobsStore.getState();

  const statusParam = params.get("status");
  if (isJobStatus(statusParam)) {
    setStatus(statusParam);
  }

  const companyId = parseCompanyIdParam(params.get("companyId"));
  if (companyId !== null) {
    setCompanyId(companyId);
  }

  const presetParam = params.get("datePreset");
  const typeParam = params.get("dateType");
  if (isPresetKey(presetParam) && isDateTypeSelection(typeParam)) {
    setDateChange({ kind: "preset", type: typeParam, key: presetParam });
  }
};

const EMPTY_INITIAL = { description: "", url: "" };

const useJobPageParams = () => {
  const { search, companyId, setCompanyId } = useJobsStore();

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    readFiltersFromParams(searchParams);
    const next = new URLSearchParams();
    for (const key of ["view", "tab", "companyId"]) {
      const value = searchParams.get(key);
      if (value) {
        next.set(key, value);
      }
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const activeCompanyId =
    companyId ?? parseCompanyIdParam(searchParams.get("companyId"));

  const updateCompanyParam = (nextCompanyId: number | null) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (nextCompanyId === null) {
          next.delete("companyId");
        } else {
          next.set("companyId", String(nextCompanyId));
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleCompanyChange = (nextCompanyId: number | null) => {
    setCompanyId(nextCompanyId);
    updateCompanyParam(nextCompanyId);
  };

  const clearDiscoverFilters = () => {
    useJobsStore.getState().setSearch("");
    setCompanyId(null);
    updateCompanyParam(null);
  };
  const hasDiscoverFilters = search || activeCompanyId !== null;

  return {
    handleCompanyChange,
    clearDiscoverFilters,
    hasDiscoverFilters,
    activeCompanyId,
  };
};

export const useJobPage = () => {
  const params = useJobPageParams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [initial, setInitial] = useState(EMPTY_INITIAL);

  const openCreate = () => {
    setInitial(EMPTY_INITIAL);
    setDialogOpen(true);
  };

  usePaste((text) => {
    const trimmed = text.trim();
    setInitial(
      isHttpUrl(trimmed)
        ? { description: "", url: trimmed }
        : { description: text, url: "" }
    );
    setDialogOpen(true);
  }, !dialogOpen);

  const handleSuccess = () => {
    setDialogOpen(false);
    setInitial(EMPTY_INITIAL);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setInitial(EMPTY_INITIAL);
    }
  };

  return {
    ...params,
    initial,
    dialogOpen,
    openCreate,
    handleSuccess,
    handleDialogOpenChange,
  };
};
