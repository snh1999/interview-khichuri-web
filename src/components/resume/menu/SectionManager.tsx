import {
  ArrowsCounterClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { useTemplateSections } from "@/components/resume/template.helpers.ts";
import type { TTemplateKey } from "@/components/resume/template-registry.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
} from "@/components/ui/item.tsx";
import { type ISectionConfig, useResumeStore } from "@/store/resumeStore.ts";

interface SectionManagerProps {
  sectionId: string;
  templateId: TTemplateKey;
}

export function SectionManager({ sectionId, templateId }: SectionManagerProps) {
  const sections = useTemplateSections(templateId);
  const setSections = useResumeStore((state) => state.setSections);
  const resetSections = useResumeStore((state) => state.resetSections);

  const move = (index: number, direction: "up" | "down") => {
    const next = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) {
      return;
    }
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setSections(templateId, next);
  };

  const updateSection = (id: string, patch: Partial<ISectionConfig>) =>
    setSections(
      templateId,
      sections.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec))
    );

  return (
    <Card id={sectionId}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PencilSimpleIcon />
          Reorganize &amp; Edit Sections
        </CardTitle>
        <CardDescription>
          Move sections to change layout order or edit section headers.
        </CardDescription>
        <CardAction>
          <Button
            // biome-ignore lint/performance/noJsxPropsBind: <renders anyways because of store, performance gain minimal>
            onClick={() => resetSections(templateId)}
            type="button"
            variant="outline"
          >
            <ArrowsCounterClockwiseIcon />
            Reset
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-2">
        {sections.map((section, index) => (
          <Item
            className={section.enabled ? "" : "opacity-50"}
            key={section.id}
            variant="outline"
          >
            <ItemMedia>
              <div className="flex flex-col gap-1">
                <Button
                  disabled={index === 0}
                  // biome-ignore lint/performance/noJsxPropsBind: <index required, new component does not solve>
                  onClick={() => move(index, "up")}
                  size="icon-xs"
                  type="button"
                  variant="outline"
                >
                  <CaretUpIcon />
                </Button>
                <Button
                  disabled={index === sections.length - 1}
                  // biome-ignore lint/performance/noJsxPropsBind: <>
                  onClick={() => move(index, "down")}
                  size="icon-xs"
                  type="button"
                  variant="outline"
                >
                  <CaretDownIcon />
                </Button>
              </div>
            </ItemMedia>
            <ItemContent>
              <Input
                // biome-ignore lint/performance/noJsxPropsBind: <section spcific>
                onChange={(e) =>
                  updateSection(section.id, { title: e.target.value })
                }
                placeholder="Section Title"
                value={section.title}
              />
            </ItemContent>
            <ItemActions>
              <Button
                // biome-ignore lint/performance/noJsxPropsBind: <section spcific>
                onClick={() =>
                  updateSection(section.id, { enabled: !section.enabled })
                }
                size="icon"
                variant="outline"
              >
                {section.enabled ? <EyeIcon /> : <EyeSlashIcon />}
              </Button>
            </ItemActions>
          </Item>
        ))}
      </CardContent>
    </Card>
  );
}
