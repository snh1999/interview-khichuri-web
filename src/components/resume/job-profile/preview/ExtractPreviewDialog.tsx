import { BackspaceIcon, FileArrowDownIcon, XIcon } from "@phosphor-icons/react";
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
import type { IRow, TPick } from "./preview.helpers.ts";
import {
  allAfterSelections,
  buildMergedData,
  buildRowGroups,
  defaultSelections,
  flattenRowGroups,
} from "./preview.helpers.ts";

interface IProps {
  before?: TProfileFormData;
  data: TExtractionResult;
  onClose: () => void;
  onMerge: (data: TProfileFormData) => void;
  onOverride: (data: TProfileFormData) => void;
}

export const ExtractPreviewDialog = ({
  before,
  data,
  onClose,
  onMerge,
  onOverride,
}: IProps) => {
  const groups = useMemo(() => buildRowGroups(before, data), [before, data]);
  const rows = useMemo(() => flattenRowGroups(groups), [groups]);
  const initialSelections = useMemo(() => defaultSelections(rows), [rows]);

  const [selections, setSelections] = useState<Record<string, TPick>>(() =>
    defaultSelections(rows)
  );
  const [edits, setEdits] = useState<Record<string, string>>({});

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

  const onOverrideClick = () =>
    onOverride(
      buildMergedData(rows, allAfterSelections(rows), edits, before, data)
    );

  const onMergeClick = () =>
    onMerge(buildMergedData(rows, selections, edits, before, data));

  const revertAll = () => {
    setSelections(initialSelections);
    setEdits({});
  };

  const onOpen = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <DrawLog onOpenChange={onOpen} open>
      <DrawLogContent className="sm:max-w-3xl">
        <DrawLogHeader>
          <DrawLogTitle className="flex items-center gap-2">
            <FileArrowDownIcon />
            Extracted Resume Data
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
                title={`Work Experience (${data.workExperience.length})`}
                {...shared}
              />
            ) : null}
            {groups.educationRows.length > 0 ? (
              <Section
                emptyHint="No education on either side"
                rows={groups.educationRows}
                title={`Education (${data.education.length})`}
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
                title={`Links (${data.links.length})`}
                {...shared}
              />
            ) : null}
            {groups.publicationRows.length > 0 ? (
              <Section
                emptyHint="No publications on either side"
                rows={groups.publicationRows}
                title={`Publications (${data.publications.length})`}
                {...shared}
              />
            ) : null}
            {groups.projectRows.length > 0 ? (
              <Section
                emptyHint="No projects on either side"
                rows={groups.projectRows}
                title={`Projects (${data.projects.length})`}
                {...shared}
              />
            ) : null}
            {groups.referenceRows.length > 0 ? (
              <Section
                emptyHint="No references on either side"
                rows={groups.referenceRows}
                title={`References (${data.references.length})`}
                {...shared}
              />
            ) : null}
            {groups.activityRows.length > 0 ? (
              <Section
                emptyHint="No activities on either side"
                rows={groups.activityRows}
                title={`Activities (${data.activities.length})`}
                {...shared}
              />
            ) : null}
          </ScrollArea>
        </DrawLogBody>

        <DrawLogFooter>
          <div className="flex justify-end gap-2 pt-2">
            <DrawLogClose
              onClick={onClose}
              render={
                <Button variant="outline">
                  <XIcon /> Cancel
                </Button>
              }
            />
            <Button onClick={onOverrideClick} variant="outline">
              Override all data
            </Button>
            <ExtraButtons
              edits={edits}
              onMerge={onMergeClick}
              revertAll={revertAll}
              rows={rows}
              selections={selections}
            />
          </div>
        </DrawLogFooter>
      </DrawLogContent>
    </DrawLog>
  );
};

const ExtraButtons = ({
  rows,
  revertAll,
  edits,
  selections,
  onMerge,
}: {
  rows: IRow[];
  revertAll: () => void;
  onMerge: () => void;
  edits: Record<string, string>;
  selections: Record<string, TPick>;
}) => {
  const initialSelections = useMemo(() => defaultSelections(rows), [rows]);

  const hasDecisions =
    Object.keys(edits).length > 0 ||
    Object.keys(selections).some(
      (key) => selections[key] !== initialSelections[key]
    );

  return (
    <div className="flex gap-2">
      {hasDecisions ? (
        <Button onClick={revertAll} variant="destructive">
          <BackspaceIcon />
          Revert All
        </Button>
      ) : null}
      <Button onClick={onMerge}>
        <FileArrowDownIcon /> {hasDecisions ? "Merge selected" : "Merge all"}
      </Button>
    </div>
  );
};
