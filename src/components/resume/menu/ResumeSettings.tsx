import { FONT_FAMILIES, type TFontFamily } from "@/components/resume/font.ts";
import { TemplatePicker } from "@/components/resume/menu/TemplatePicker.tsx";
import type {
  PdfSettings,
  RenderMode,
} from "@/components/resume/PDFAdapter.tsx";
import type { TTemplateKey } from "@/components/resume/template-registry.ts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";

export interface ResumeSettingsValue {
  templateId: TTemplateKey;
  mode: RenderMode;
  pdfSettings: Partial<PdfSettings>;
}

interface ResumeSettingsMenuProps {
  value: ResumeSettingsValue;
  effective: PdfSettings;
  onChange: (next: ResumeSettingsValue) => void;
}

const FONT_CATEGORIES = ["sans", "serif"] as const;

export function ResumeSettingsMenu({
  value,
  effective,
  onChange,
}: ResumeSettingsMenuProps) {
  const { templateId, mode, pdfSettings } = value;

  const updatePdfSettings = (patch: Partial<PdfSettings>) => {
    onChange({ ...value, pdfSettings: { ...pdfSettings, ...patch } });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-background px-3 py-2">
      <div className="flex items-center gap-1">
        <span className="font-medium text-[11px] text-muted-foreground leading-none">
          Template
        </span>
        <TemplatePicker
          // biome-ignore lint/performance/noJsxPropsBind: <uses prop, rerender anyways>
          onChange={(v) => onChange({ ...value, templateId: v })}
          templateId={templateId}
        />
      </div>

      <Separator className="mx-1 h-5" orientation="vertical" />

      <ToggleGroup
        // biome-ignore lint/performance/noJsxPropsBind: <>
        onValueChange={(v) =>
          v[0] && onChange({ ...value, mode: v[0] as RenderMode })
        }
        size="sm"
        spacing={0}
        value={[mode]}
        variant="outline"
      >
        <ToggleGroupItem value="web">Web</ToggleGroupItem>
        <ToggleGroupItem value="pdf">PDF</ToggleGroupItem>
      </ToggleGroup>

      <Separator className="mx-1 h-5" orientation="vertical" />

      <div className="flex items-center gap-1">
        <span className="font-medium text-[11px] text-muted-foreground leading-none">
          Font
        </span>
        <Select
          // biome-ignore lint/performance/noJsxPropsBind: <>
          onValueChange={(v) =>
            updatePdfSettings({ fontFamily: v as TFontFamily })
          }
          value={effective.fontFamily}
        >
          <SelectTrigger className="min-w-28" size="sm">
            <SelectValue style={{ fontFamily: effective.fontFamily }} />
          </SelectTrigger>
          <SelectContent>
            {FONT_CATEGORIES.map((cat) => (
              <SelectGroup key={cat}>
                <SelectLabel>
                  {cat === "sans" ? "Sans Serif" : "Serif"}
                </SelectLabel>
                {Object.entries(FONT_FAMILIES)
                  .filter(([, meta]) => meta.category === cat)
                  .map(([name]) => (
                    <SelectItem key={name} value={name}>
                      <span style={{ fontFamily: name }}>{name}</span>
                    </SelectItem>
                  ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <span className="font-medium text-[11px] text-muted-foreground leading-none">
          Size
        </span>
        <Select
          // biome-ignore lint/performance/noJsxPropsBind: <>
          onValueChange={(v) => updatePdfSettings({ fontSize: Number(v) })}
          value={String(effective.fontSize)}
        >
          <SelectTrigger className="w-14" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[8, 9, 10, 11, 12, 13, 14].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <span className="font-medium text-[11px] text-muted-foreground leading-none">
          Line
        </span>
        <Select
          // biome-ignore lint/performance/noJsxPropsBind: <>
          onValueChange={(v) => updatePdfSettings({ lineHeight: Number(v) })}
          value={String(effective.lineHeight)}
        >
          <SelectTrigger className="w-16" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 21 }, (_, i) => {
              const v = 1 + i * 0.05;
              return (
                <SelectItem key={v} value={String(v)}>
                  {v.toFixed(2)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <span className="font-medium text-[11px] text-muted-foreground leading-none">
          Pad
        </span>
        <Select
          // biome-ignore lint/performance/noJsxPropsBind: <>
          onValueChange={(v) => updatePdfSettings({ padding: Number(v) })}
          value={String(effective.padding)}
        >
          <SelectTrigger className="w-16" size="sm">
            <SelectValue>{(effective.padding / 72).toFixed(2)}in</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 17 }, (_, i) => {
              const inches = 0.4 + i * 0.05;
              const pts = inches * 72;
              return (
                <SelectItem key={pts} value={String(pts)}>
                  {inches.toFixed(2)}in
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {mode === "pdf" && (
        <span className="mt-1 basis-full text-[11px] text-muted-foreground">
          PDF mode static — edits won&apos;t update live.
        </span>
      )}
    </div>
  );
}
