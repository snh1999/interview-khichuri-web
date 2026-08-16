import {
  BackspaceIcon,
  CheckIcon,
  ChecksIcon,
  FileArrowDownIcon,
  SubtractSquareIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { TExtractionResult } from "@/api/profile";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { Section } from "@/components/resume/job-profile/preview/Section.tsx";
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
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import {
  allAfterSelections,
  buildMergedData,
  buildRowGroups,
  defaultSelections,
  flattenRowGroups,
  type TPick,
} from "./preview.helpers.ts";

interface IProps {
  before?: TProfileFormData;
  data: TExtractionResult;
  onClose: () => void;
  onMerge: (data: TProfileFormData) => void;
  onOverride: (data: TProfileFormData) => void;
}

const sectionCount = (items: readonly unknown[] | undefined): number =>
  items?.length ?? 0;

type TMode = "merge" | "override";

export const ExtractPreviewDialog = ({
  before,
  data,
  onClose,
  onMerge,
  onOverride,
}: IProps) => {
  const groups = useMemo(() => buildRowGroups(before, data), [before, data]);
  const rows = useMemo(() => flattenRowGroups(groups), [groups]);
  const initialData = useMemo(() => defaultSelections(rows), [rows]);

  const [selections, setSelections] = useState<Record<string, TPick>>(() =>
    defaultSelections(rows)
  );
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<TMode>("merge");

  const hasDecisions =
    Object.keys(edits).length > 0 ||
    mode === "override" ||
    Object.keys(selections).some((key) => selections[key] !== initialData[key]);

  const onSelect = (key: string, pick: TPick) =>
    setSelections((prev) => ({ ...prev, [key]: pick }));

  const onEdit = (key: string, value: string | undefined) =>
    setEdits((prev) => {
      if (value === undefined) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });

  const shared = { edits, onEdit, onSelect, selections };

  const onMergeAllClick = () => {
    setSelections(allAfterSelections(rows));
    setMode("merge");
  };

  const onOverrideClick = () => {
    setSelections(allAfterSelections(rows));
    setMode("override");
  };

  const onApplyClick = () => {
    if (mode === "override") {
      onOverride(
        buildMergedData(rows, allAfterSelections(rows), edits, undefined, data)
      );
      return;
    }
    onMerge(buildMergedData(rows, selections, edits, before, data));
  };

  const revertAll = () => {
    setSelections(defaultSelections(rows));
    setEdits({});
    setMode("merge");
  };

  const onOpen = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <DrawLog onOpenChange={onOpen} open>
      <DrawLogContent className="sm:max-w-3xl" showCloseButton={false}>
        <DrawLogHeader>
          <DrawLogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileArrowDownIcon />
              Extracted Resume Data
            </div>
            <SelectionButtons
              hasDecisions={hasDecisions}
              onMergeAll={onMergeAllClick}
              onOverride={onOverrideClick}
              onRevert={revertAll}
            />
          </DrawLogTitle>
        </DrawLogHeader>

        <DrawLogBody>
          <ScrollArea className="flex flex-col gap-4 pr-1">
            <Section
              rows={groups.personalRows}
              title="Personal Information"
              {...shared}
            />
            <Section
              rows={groups.professionalRows}
              title="Professional Information"
              {...shared}
            />
            {groups.workExperienceRows.length > 0 ? (
              <Section
                emptyHint="No work experience on either side"
                rows={groups.workExperienceRows}
                title={`Work Experience (${sectionCount(data.workExperience)})`}
                {...shared}
              />
            ) : null}
            {groups.educationRows.length > 0 ? (
              <Section
                emptyHint="No education on either side"
                rows={groups.educationRows}
                title={`Education (${sectionCount(data.education)})`}
                {...shared}
              />
            ) : null}
            <Section
              rows={groups.preferencesRows}
              title="Preferences"
              {...shared}
            />
            {groups.linkRows.length > 0 ? (
              <Section
                emptyHint="No links on either side"
                rows={groups.linkRows}
                title={`Links (${sectionCount(data.links)})`}
                {...shared}
              />
            ) : null}
            {groups.publicationRows.length > 0 ? (
              <Section
                emptyHint="No publications on either side"
                rows={groups.publicationRows}
                title={`Publications (${sectionCount(data.publications)})`}
                {...shared}
              />
            ) : null}
            {groups.projectRows.length > 0 ? (
              <Section
                emptyHint="No projects on either side"
                rows={groups.projectRows}
                title={`Projects (${sectionCount(data.projects)})`}
                {...shared}
              />
            ) : null}
            {groups.referenceRows.length > 0 ? (
              <Section
                emptyHint="No references on either side"
                rows={groups.referenceRows}
                title={`References (${sectionCount(data.references)})`}
                {...shared}
              />
            ) : null}
            {groups.activityRows.length > 0 ? (
              <Section
                emptyHint="No activities on either side"
                rows={groups.activityRows}
                title={`Activities (${sectionCount(data.activities)})`}
                {...shared}
              />
            ) : null}
          </ScrollArea>
        </DrawLogBody>

        <DrawLogFooter>
          <div className="flex items-center justify-between gap-2 pt-2">
            <DrawLogClose
              onClick={onClose}
              render={
                <Button variant="outline">
                  <XIcon /> Cancel
                </Button>
              }
            />
            <Button disabled={!hasDecisions} onClick={onApplyClick}>
              <ChecksIcon /> Apply
            </Button>
          </div>
        </DrawLogFooter>
      </DrawLogContent>
    </DrawLog>
  );
};

const SelectionButtons = ({
  hasDecisions,
  onMergeAll,
  onOverride,
  onRevert,
}: {
  hasDecisions: boolean;
  onMergeAll: () => void;
  onOverride: () => void;
  onRevert: () => void;
}) => (
  <div className="flex gap-0.5">
    <Button
      disabled={!hasDecisions}
      onClick={onRevert}
      size="xs"
      variant="destructive"
    >
      <BackspaceIcon />
      Discard
    </Button>
    <Button onClick={onOverride} size="xs" variant="destructive">
      <SubtractSquareIcon />
      Override
    </Button>
    <Button onClick={onMergeAll} size="xs" variant="default">
      <CheckIcon />
      Accept All
    </Button>
  </div>
);
