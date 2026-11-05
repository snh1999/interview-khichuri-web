import { PlusIcon } from "@phosphor-icons/react";
import type React from "react";
import { toast } from "sonner";
import { useProfileQuery } from "@/api/profile/profiles.ts";
import { Button } from "@/components/ui/button";
import { generateSafeId } from "@/lib/utils";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import { applyProfileTokens, DEFAULT_THEMES } from "../utils/defaultPortfolios";
import { getEmptyFramePosition } from "../utils/framePlacement";
import { PORTFOLIO_PAGE_TEMPLATES } from "../utils/portfolioTemplates";
import { getCenteredViewport } from "../utils/viewport";

interface TemplatesTabProps {
  onSwitchToPages: () => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  onSwitchToPages,
}) => {
  const addElements = useSketchBuilderStore((s) => s.addElements);
  const setTheme = useSketchBuilderStore((s) => s.setTheme);
  const selectElements = useSketchBuilderStore((s) => s.selectElements);
  const setViewport = useSketchBuilderStore((s) => s.setViewport);
  const setCurrentTool = useSketchBuilderStore((s) => s.setCurrentTool);
  const currentPortfolio = useCurrentPortfolio();
  const { data: profile } = useProfileQuery();
  const { elements } = currentPortfolio;

  const handleInsertTemplate = (templateId: string) => {
    const template = PORTFOLIO_PAGE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return;
    }

    const nextX = getEmptyFramePosition(elements).x;

    const newFrameId = generateSafeId("frame-tpl");
    const generatedElements = applyProfileTokens(
      template.elements(newFrameId, nextX, 60),
      {
        name: [profile?.firstName, profile?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim(),
        title: profile?.workOverviews?.[0]?.title ?? "",
        email: profile?.email ?? "",
      }
    );

    addElements(generatedElements);

    const matchingTheme = DEFAULT_THEMES.find((t) => t.id === template.themeId);
    if (matchingTheme) {
      setTheme(matchingTheme);
    }

    selectElements([newFrameId]);
    const newFrame = generatedElements.find((el) => el.id === newFrameId);
    if (newFrame) {
      setViewport(getCenteredViewport(newFrame, currentPortfolio.viewport));
    }
    setCurrentTool("select");
    onSwitchToPages();
    toast.success(`Inserted "${template.title}" template page into canvas!`);
  };

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-3 text-xs">
      <div className="flex items-center justify-between px-1">
        <span className="text-muted-foreground text-xxs font-bold tracking-wider uppercase">
          Ready-to-Use Templates ({PORTFOLIO_PAGE_TEMPLATES.length})
        </span>
      </div>

      <p className="text-muted-foreground px-1 text-xs">
        Insert pre-built portfolio artboard pages directly into your canvas:
      </p>

      <div className="space-y-2.5">
        {PORTFOLIO_PAGE_TEMPLATES.map((tpl) => (
          <div
            className="group border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40 space-y-2 rounded-xl border p-3 transition-all"
            key={tpl.id}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-foreground group-hover:text-primary font-bold transition-colors">
                  {tpl.title}
                </div>
                <div className="text-primary text-xxs font-medium">
                  {tpl.role}
                </div>
              </div>
              <span className="border-border bg-background text-muted-foreground text-xxs shrink-0 rounded border px-1.5 py-0.5 font-mono">
                {tpl.badge}
              </span>
            </div>

            <p className="text-muted-foreground text-xxs line-clamp-2 leading-relaxed">
              {tpl.description}
            </p>

            <div className="border-border/50 flex items-center justify-between gap-2 border-t pt-1">
              <span className="text-muted-foreground text-xxs italic">
                Theme:{" "}
                {DEFAULT_THEMES.find((t) => t.id === tpl.themeId)?.name ||
                  "Custom"}
              </span>
              <Button
                // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped page template
                onClick={() => handleInsertTemplate(tpl.id)}
                size="xs"
              >
                <PlusIcon size={11} weight="bold" />
                <span>Insert Page</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
