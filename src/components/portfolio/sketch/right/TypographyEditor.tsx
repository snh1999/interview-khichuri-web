import type React from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import type { CanvasElement, TextElement } from "../types";
import { FONT_FAMILY_OPTIONS } from "./constants";

interface TypographyEditorProps {
  activeElement: CanvasElement;
}

export const TypographyEditor: React.FC<TypographyEditorProps> = ({
  activeElement,
}) => {
  const updateElement = useSketchBuilderStore((s) => s.updateElement);
  const recordHistory = useSketchBuilderStore((s) => s.recordHistory);
  const setFontSize = useSketchBuilderStore((s) => s.setFontSize);
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    updateElement(activeElement.id, { text: e.target.value });
  const handleTextFocus = () => recordHistory();
  const handleFontFamilyChange = (fontFamily: string | null) => {
    if (fontFamily) {
      updateElement(activeElement.id, { fontFamily }, true);
    }
  };
  const handleFontWeightChange = (
    fontWeight: "normal" | "500" | "600" | "bold" | null
  ) => {
    if (fontWeight) {
      updateElement(activeElement.id, { fontWeight }, true);
    }
  };
  const handleFontSizeClick = (size: number) => {
    updateElement(activeElement.id, { fontSize: size }, true);
    setFontSize(size);
  };
  return (
    <div className="space-y-3 border-border border-t pt-2">
      <span className="font-bold text-muted-foreground text-xxs uppercase tracking-wider">
        Typography & Text
      </span>
      <Textarea
        className="resize-none rounded-xl border-border bg-background px-2.5 py-1.5 text-foreground text-xs"
        onChange={handleTextChange}
        onFocus={handleTextFocus}
        rows={2}
        value={(activeElement as TextElement).text || ""}
      />

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <span className="text-muted-foreground text-xxs">Font Family</span>
          <Select
            onValueChange={handleFontFamilyChange}
            value={(activeElement as TextElement).fontFamily || "sans-serif"}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILY_OPTIONS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <span className="text-muted-foreground text-xxs">Font Weight</span>
          <Select
            onValueChange={handleFontWeightChange}
            value={(activeElement as TextElement).fontWeight || "normal"}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Regular (400)</SelectItem>
              <SelectItem value="500">Medium (500)</SelectItem>
              <SelectItem value="600">Semibold (600)</SelectItem>
              <SelectItem value="bold">Bold (700)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-muted-foreground text-xs">Font Size</span>
        <div className="flex items-center gap-1.5">
          {[12, 16, 20, 28, 36].map((sz) => (
            <Button
              className={`font-mono ${
                (activeElement as TextElement).fontSize === sz
                  ? "bg-primary font-bold text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              key={sz}
              // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped font size
              onClick={() => handleFontSizeClick(sz)}
              variant="ghost"
            >
              {sz}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
