import { CalendarDotsIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import type { IDateFilter } from "@/api/jobs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button.tsx";
import { DatePicker } from "@/components/ui/custom/DatePicker.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";
import { stringToDate } from "@/lib/utils.ts";
import { useJobsStore } from "@/store/useJobsStore.ts";
import {
  DATE_TYPE_SELECTIONS,
  getDatePreset,
  JOB_DATE_PRESETS,
  JOB_DATE_TYPE_LABELS,
  resolveDateFilters,
  type TJobDatePresetKey,
  type TJobDateTypeSelection,
} from "./jobDatePresets";

const getLabel = (
  preset: TJobDatePresetKey | undefined,
  dateType: TJobDateTypeSelection,
  hasValue: boolean
): string => {
  if (preset) {
    return `${JOB_DATE_TYPE_LABELS[dateType]} · ${
      getDatePreset(preset)?.label ?? ""
    }`;
  }
  if (hasValue) {
    return `${JOB_DATE_TYPE_LABELS[dateType]} | Custom`;
  }
  return "Date range";
};

export const JobsDateFilter = () => {
  const { dateType, datePreset, dateFrom, dateTo, setDateChange } =
    useJobsStore();

  const value = useMemo<IDateFilter[]>(
    () => resolveDateFilters({ dateType, datePreset, dateFrom, dateTo }),
    [dateType, datePreset, dateFrom, dateTo]
  );

  const [open, setOpen] = useState(false);
  const isCustomApplied = !datePreset && value.length > 0;
  const appliedCustom =
    value.find((filter) => filter.type === dateType) ?? value[0];
  const [draft, setDraft] = useState({
    type: dateType,
    from: isCustomApplied ? stringToDate(appliedCustom?.from) : undefined,
    to: isCustomApplied ? stringToDate(appliedCustom?.to) : undefined,
  });

  useEffect(() => {
    const custom = datePreset
      ? undefined
      : (value.find((filter) => filter.type === dateType) ?? value[0]);
    setDraft({
      type: dateType,
      from: stringToDate(custom?.from),
      to: stringToDate(custom?.to),
    });
  }, [datePreset, dateType, value]);

  const appliedLabel = getLabel(datePreset, dateType, value.length > 0);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
  };

  const handleTypeSelect = (values: string[]) => {
    const type = values[0] as TJobDateTypeSelection | undefined;
    if (!type || type === draft.type) {
      return;
    }
    setDraft((d) => ({ ...d, type }));
    if (datePreset) {
      setDateChange({ kind: "preset", type, key: datePreset });
    } else if (value.length > 0) {
      setDateChange({ ...appliedCustom, kind: "custom", type });
    }
  };

  const handlePresetSelect = (key: TJobDatePresetKey) => {
    setDraft((d) => ({ ...d, from: undefined, to: undefined }));
    setDateChange({ kind: "preset", type: draft.type, key });
  };

  const handleCustomFromChange = (date?: Date) =>
    setDraft((d) => ({ ...d, from: date }));
  const handleCustomToChange = (date?: Date) =>
    setDraft((d) => ({ ...d, to: date }));

  const handleCustomApply = () => {
    if (draft.from || draft.to) {
      setDateChange({
        kind: "custom",
        type: draft.type,
        from: draft.from?.toISOString(),
        to: draft.to?.toISOString(),
      });
      setOpen(false);
    }
  };

  const handleClear = () => {
    setDraft((d) => ({ ...d, from: undefined, to: undefined }));
    setDateChange(undefined);
  };

  const customDisabled = !(draft.from || draft.to);

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger
        render={
          <Button className="gap-1.5" variant="outline">
            <CalendarDotsIcon className="size-3.5" />
            <span className="max-w-40 truncate">{appliedLabel}</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-90 gap-3 p-3" sideOffset={6}>
        <div className="flex items-center justify-between">
          <ToggleGroup
            className="w-full gap-0"
            onValueChange={handleTypeSelect}
            value={[draft.type]}
          >
            {DATE_TYPE_SELECTIONS.map((typeValue) => (
              <ToggleGroupItem key={typeValue} value={typeValue}>
                {JOB_DATE_TYPE_LABELS[typeValue]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {value.length > 0 ? (
            <Button onClick={handleClear} size="sm" variant="destructive">
              <XIcon /> Clear
            </Button>
          ) : null}
        </div>

        <div className="flex gap-0.5">
          {JOB_DATE_PRESETS.map((item) => (
            <Button
              className={datePreset === item.key ? "bg-muted" : ""}
              key={item.key}
              // biome-ignore lint/performance/noJsxPropsBind: <>
              onClick={() => handlePresetSelect(item.key)}
              variant="ghost"
            >
              {item.label}
            </Button>
          ))}
        </div>

        <Accordion defaultValue={isCustomApplied ? ["custom"] : []}>
          <AccordionItem value="custom">
            <AccordionTrigger>Custom range</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-1.5 pt-2">
                <DatePicker
                  onChange={handleCustomFromChange}
                  placeholder="From"
                  value={draft.from}
                />
                <DatePicker
                  onChange={handleCustomToChange}
                  placeholder="To"
                  value={draft.to}
                />
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <Button
                    disabled={customDisabled}
                    onClick={handleCustomApply}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </PopoverContent>
    </Popover>
  );
};
