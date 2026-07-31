import {
  ArrowsCounterClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { useTemplateSections } from "@/components/resume/temp/template.helpers.ts";
import type { TTemplateKey } from "@/components/resume/temp/template-registry.ts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
} from "@/components/ui/item.tsx";
import { useResumeStore } from "@/store/resumeStore";

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
                  onClick={() => move(index, "up")}
                  size="icon-xs"
                  type="button"
                  variant="outline"
                >
                  <CaretUpIcon />
                </Button>
                <Button
                  disabled={index === sections.length - 1}
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
                onChange={(e) =>
                  setSections(
                    templateId,
                    sections.map((sec) =>
                      sec.id === section.id
                        ? { ...sec, title: e.target.value }
                        : sec
                    )
                  )
                }
                placeholder="Section Title"
                value={section.title}
              />
            </ItemContent>
            <ItemActions>
              <Button
                onClick={() =>
                  setSections(
                    templateId,
                    sections.map((sec) =>
                      sec.id === section.id
                        ? { ...sec, enabled: !sec.enabled }
                        : sec
                    )
                  )
                }
                size="icon"
                type="button"
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
