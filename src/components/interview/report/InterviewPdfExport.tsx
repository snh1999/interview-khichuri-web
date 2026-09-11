import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  type IInterview,
  useInterviewArchive,
} from "@/api/sessions/interviews.ts";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  DrawLog,
  DrawLogBody,
  DrawLogContent,
  DrawLogDescription,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog";
import { Label } from "@/components/ui/label.tsx";
import {
  ReportPdfTemplate,
  SECTION_OPTIONS,
  type TSectionKey,
} from "./ReportPdfTemplate.tsx";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: IInterview;
}

export const InterviewPdfExport = ({
  open,
  onOpenChange,
  interview,
}: Readonly<IProps>) => {
  const { data: archive } = useInterviewArchive(interview.id, open);
  const [sections, setSections] = useState<TSectionKey[]>(
    SECTION_OPTIONS.map((option) => option.key)
  );

  const toggleSection = (key: TSectionKey) => {
    setSections((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleExport = async () => {
    const firstName = interview.id.slice(0, 8);
    const { pdf } = await import("@react-pdf/renderer");

    const doc = (
      <ReportPdfTemplate
        archive={archive}
        interview={interview}
        sections={sections}
      />
    );

    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-${firstName}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    onOpenChange(false);
  };

  const handleCloseDialog = () => onOpenChange(false);

  return (
    <DrawLog onOpenChange={onOpenChange} open={open}>
      <DrawLogContent className="gap-0">
        <DrawLogHeader>
          <DrawLogTitle>Export Report to PDF</DrawLogTitle>
          <DrawLogDescription>
            Choose which sections to include in the PDF.
          </DrawLogDescription>
        </DrawLogHeader>

        <DrawLogBody className="space-y-2 px-3">
          {SECTION_OPTIONS.map((option) => (
            <Label
              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-normal text-sm"
              key={option.key}
            >
              <Checkbox
                checked={sections.includes(option.key)}
                // biome-ignore lint/performance/noJsxPropsBind: toggleSection needs the section key
                onCheckedChange={() => toggleSection(option.key)}
              />
              {option.label}
            </Label>
          ))}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleCloseDialog} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <DownloadSimpleIcon className="size-4" />
              Export PDF
            </Button>
          </div>
        </DrawLogBody>
      </DrawLogContent>
    </DrawLog>
  );
};
