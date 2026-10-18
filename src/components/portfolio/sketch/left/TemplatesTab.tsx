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
        <span className="font-bold text-muted-foreground text-xxs uppercase tracking-wider">
          Ready-to-Use Templates ({PORTFOLIO_PAGE_TEMPLATES.length})
        </span>
      </div>

      <p className="px-1 text-muted-foreground text-xs">
        Insert pre-built portfolio artboard pages directly into your canvas:
      </p>

      <div className="space-y-2.5">
        {PORTFOLIO_PAGE_TEMPLATES.map((tpl) => (
          <div
            className="group space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3 transition-all hover:border-primary/50 hover:bg-muted/40"
            key={tpl.id}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-foreground transition-colors group-hover:text-primary">
                  {tpl.title}
                </div>
                <div className="font-medium text-primary text-xxs">
                  {tpl.role}
                </div>
              </div>
              <span className="shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-muted-foreground text-xxs">
                {tpl.badge}
              </span>
            </div>

            <p className="line-clamp-2 text-muted-foreground text-xxs leading-relaxed">
              {tpl.description}
            </p>

            <div className="flex items-center justify-between gap-2 border-border/50 border-t pt-1">
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
