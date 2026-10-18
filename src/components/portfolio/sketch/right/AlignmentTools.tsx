import {
  AlignBottomIcon,
  AlignCenterHorizontalIcon,
  AlignCenterVerticalIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignTopIcon,
} from "@phosphor-icons/react";
import type React from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";

export const AlignmentTools: React.FC = () => {
  const alignSelectedElements = useSketchBuilderStore(
    (s) => s.alignSelectedElements
  );
  const handleAlignLeft = () => alignSelectedElements("left");
  const handleAlignCenterHorizontal = () => alignSelectedElements("center");
  const handleAlignRight = () => alignSelectedElements("right");
  const handleAlignTop = () => alignSelectedElements("top");
  const handleAlignCenterVertical = () => alignSelectedElements("middle");
  const handleAlignBottom = () => alignSelectedElements("bottom");
  return (
    <div className="space-y-1.5">
      <span className="font-bold text-muted-foreground text-xxs uppercase tracking-wider">
        Align Selection
      </span>
      <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/40 p-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button onClick={handleAlignLeft} size="icon" variant="ghost">
                <AlignLeftIcon />
              </Button>
            }
          />
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={handleAlignCenterHorizontal}
                size="icon"
                variant="ghost"
              >
                <AlignCenterHorizontalIcon />
              </Button>
            }
          />
          <TooltipContent>Align Horizontal Center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button onClick={handleAlignRight} size="icon" variant="ghost">
                <AlignRightIcon />
              </Button>
            }
          />
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>

        <div className="mx-1 h-4 w-px bg-border" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button onClick={handleAlignTop} size="icon" variant="ghost">
                <AlignTopIcon />
              </Button>
            }
          />
          <TooltipContent>Align Top</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={handleAlignCenterVertical}
                size="icon"
                variant="ghost"
              >
                <AlignCenterVerticalIcon />
              </Button>
            }
          />
          <TooltipContent>Align Vertical Center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button onClick={handleAlignBottom} size="icon" variant="ghost">
                <AlignBottomIcon />
              </Button>
            }
          />
          <TooltipContent>Align Bottom</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
