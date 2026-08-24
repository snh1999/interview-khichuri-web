import { useCallback } from "react";
import { FormDatePicker } from "@/components/common/form/FormDatePicker.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DrawLog,
  DrawLogBody,
  DrawLogClose,
  DrawLogContent,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog.tsx";
import { cn } from "@/lib/utils";
import { useScheduleStore } from "@/store/scheduleStore.ts";
import { EVENT_COLOR_KEYS, EVENT_COLOR_OPTIONS } from "../calendar.types";
import { useUpsertEventForm } from "./UpsertEventForm.helpers.ts";

const DURATION_PRESETS = [
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "2h", minutes: 120 },
  { label: "4h", minutes: 240 },
  { label: "8h", minutes: 480 },
  { label: "12h", minutes: 720 },
  { label: "24h", minutes: 1440 },
] as const;

interface PresetButtonProps {
  minutes: number;
  onPreset: (minutes: number) => void;
}

interface ColorSwatchProps {
  colorKey: string | null;
  swatchClassName: string;
  selected: boolean;
  title: string;
  ariaLabel: string;
  onSelectColor: (color: string | null) => void;
}

const ColorSwatch = ({
  colorKey,
  swatchClassName,
  selected,
  title,
  ariaLabel,
  onSelectColor,
}: ColorSwatchProps) => {
  const handleClick = useCallback(
    () => onSelectColor(colorKey),
    [onSelectColor, colorKey]
  );
  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={cn(
        "flex size-6 items-center justify-center rounded-full transition-shadow",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
      )}
      onClick={handleClick}
      title={title}
      type="button"
    >
      <span className={cn("size-4 rounded-full", swatchClassName)} />
    </button>
  );
};

const PresetButton = ({ minutes, onPreset }: PresetButtonProps) => {
  const label = DURATION_PRESETS.find((p) => p.minutes === minutes)?.label;
  const handleClick = useCallback(() => onPreset(minutes), [onPreset, minutes]);
  return (
    <Button onClick={handleClick} size="sm" type="button" variant="outline">
      {label}
    </Button>
  );
};

export const UpsertEventForm = () => {
  const drawerOpen = useScheduleStore((s) => s.drawerOpen);
  const drawerPrefill = useScheduleStore((s) => s.drawerPrefill);
  const editingEvent = useScheduleStore((s) => s.editingEvent);
  const closeDrawer = useScheduleStore((s) => s.closeDrawer);

  const event = editingEvent;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDrawer();
    }
  };

  const {
    allDay,
    form,
    handlePreset,
    handleToggleAllDay,
    isLoading,
    handleSubmit,
    isMultiDay,
  } = useUpsertEventForm({
    event,
    open: drawerOpen,
    prefill: drawerPrefill,
    closeDrawLog: closeDrawer,
  });

  // All-day hides the time inputs, except for multi-day ranges where exact
  // times still matter (e.g. a conference from Mar 5 09:00 to Mar 7 18:00).
  const withTime = !allDay || isMultiDay;
  const selectedColor = form.watch("color") ?? null;
  const handleSelectColor = useCallback(
    (color: string | null) => form.setValue("color", color),
    [form]
  );

  return (
    <DrawLog onOpenChange={handleOpenChange} open={drawerOpen}>
      <DrawLogContent>
        <DrawLogHeader>
          <DrawLogTitle>{event ? "Edit Event" : "Add Event"}</DrawLogTitle>
        </DrawLogHeader>

        <form onSubmit={handleSubmit}>
          <DrawLogBody>
            <FormInput
              autoFocus
              form={form}
              label="Title"
              name="title"
              placeholder="e.g. Follow up with recruiter"
            />

            <FormDatePicker
              form={form}
              label="Start"
              name="startDate"
              placeholder="Pick start date..."
              withTime={withTime}
            />

            <FormDatePicker
              form={form}
              label="End"
              name="endDate"
              placeholder="Pick end date..."
              withTime={withTime}
            />

            {isMultiDay ? null : (
              <div className="flex flex-col gap-1.5">
                <span className="font-medium text-sm">Quick duration</span>
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_PRESETS.map((p) => (
                    <PresetButton
                      key={p.label}
                      minutes={p.minutes}
                      onPreset={handlePreset}
                    />
                  ))}
                  <Button
                    aria-pressed={allDay}
                    onClick={handleToggleAllDay}
                    size="sm"
                    type="button"
                    variant={allDay ? "default" : "outline"}
                  >
                    All day
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-sm">Color</span>
              <div className="flex flex-wrap gap-1.5">
                <ColorSwatch
                  ariaLabel="Default color"
                  colorKey={null}
                  onSelectColor={handleSelectColor}
                  selected={selectedColor === null}
                  swatchClassName="border-muted-foreground/40 border bg-transparent"
                  title="Default"
                />
                {EVENT_COLOR_KEYS.map((key) => (
                  <ColorSwatch
                    ariaLabel={`${key} color`}
                    colorKey={key}
                    key={key}
                    onSelectColor={handleSelectColor}
                    selected={selectedColor === key}
                    swatchClassName={EVENT_COLOR_OPTIONS[key].dot}
                    title={key}
                  />
                ))}
              </div>
            </div>

            <FormInput
              form={form}
              label="Description"
              name="description"
              placeholder="Add notes or details..."
              textArea
            />

            {/* TODO: Restore Google Calendar Sync section once Google OAuth calendar.events scope is approved
              1. FORM CHECKBOX for privateSync
              2. googleTitle in if private is selected
            */}
          </DrawLogBody>

          <DrawLogFooter className="flex sm:justify-between">
            <DrawLogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DrawLogClose>
            <AsyncButton
              disabled={event && !form.formState.isDirty}
              isLoading={isLoading}
              type="submit"
            >
              {event ? "Update" : "Save"}
            </AsyncButton>
          </DrawLogFooter>
        </form>
      </DrawLogContent>
    </DrawLog>
  );
};
