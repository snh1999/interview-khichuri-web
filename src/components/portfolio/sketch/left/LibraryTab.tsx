import {
  BriefcaseIcon,
  BrowsersIcon,
  ChatTeardropTextIcon,
  EnvelopeSimpleIcon,
  FolderSimpleStarIcon,
  PlusIcon,
  SparkleIcon,
  ToggleRightIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import type React from "react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { generateSafeId } from "@/lib/utils";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import type { FrameElement, StampElement, StampType } from "../types";
import { getStampDefaults } from "../utils/stampConstants";
import { getCenteredViewport } from "../utils/viewport";
import { getNextZIndex } from "../utils/zIndex";

export const LibraryTab: React.FC = () => {
  const addElement = useSketchBuilderStore((s) => s.addElement);
  const selectElements = useSketchBuilderStore((s) => s.selectElements);
  const setViewport = useSketchBuilderStore((s) => s.setViewport);
  const setCurrentTool = useSketchBuilderStore((s) => s.setCurrentTool);
  const selectedElementIds = useSketchBuilderStore((s) => s.selectedElementIds);
  const currentPortfolio = useCurrentPortfolio();
  const { elements } = currentPortfolio;

  const frameElements = useMemo(
    () => elements.filter((el) => el.type === "frame") as FrameElement[],
    [elements]
  );

  const handleAddStampQuick = (stampType: StampType) => {
    const defaults = getStampDefaults(stampType);
    // Prefer a selected editable frame, else the first visible, unlocked one, so
    // a new component never inherits a hidden/locked frame's state.
    const isEditable = (f: FrameElement) => f.visible !== false && !f.locked;
    const targetFrame =
      frameElements.find(
        (f) => selectedElementIds.includes(f.id) && isEditable(f)
      ) ?? frameElements.find(isEditable);
    const offset = (elements.length % 6) * 28;
    const newStamp: StampElement = {
      id: generateSafeId("stamp"),
      type: "stamp",
      stampType,
      name: defaults.label,
      label: defaults.label,
      sublabel: defaults.sublabel,
      x: targetFrame ? targetFrame.x + 40 + offset : 100 + offset,
      y: targetFrame ? targetFrame.y + 100 + offset : 100 + offset,
      width: defaults.width,
      height: defaults.height,
      strokeColor: defaults.strokeColor,
      fillColor: defaults.fillColor,
      strokeWidth: 1.5,
      opacity: 1,
      cornerRadius: 12,
      frameId: targetFrame?.id,
      zIndex: getNextZIndex(elements),
    };

    addElement(newStamp);
    selectElements([newStamp.id]);
    setViewport(getCenteredViewport(newStamp, currentPortfolio.viewport));
    setCurrentTool("select");
    toast.success(
      `Added ${defaults.label.split("•")[0].split("—")[0].trim()} component`
    );
  };

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-3 text-xs">
      <div className="px-1 font-bold text-muted-foreground text-xxs uppercase tracking-wider">
        Click to Insert Component
      </div>

      <div className="space-y-2">
        {[
          {
            type: "navbar" as StampType,
            label: "Navigation Bar",
            desc: "Header logo + menu links + CTA",
            icon: <BrowsersIcon size={16} />,
          },
          {
            type: "hero" as StampType,
            label: "Hero Bio & Statement",
            desc: "Personal statement + contact pill",
            icon: <UserCircleIcon size={16} />,
          },
          {
            type: "project" as StampType,
            label: "Project Case Study Card",
            desc: "Case study card with metrics & tags",
            icon: <FolderSimpleStarIcon size={16} />,
          },
          {
            type: "skills" as StampType,
            label: "Tech Stack & Skills",
            desc: "Frontend & backend proficiency pills",
            icon: <SparkleIcon size={16} />,
          },
          {
            type: "experience" as StampType,
            label: "Work Experience Timeline",
            desc: "Career history roles & education",
            icon: <BriefcaseIcon size={16} />,
          },
          {
            type: "testimonial" as StampType,
            label: "Peer Testimonial Quote",
            desc: "Recommendation quote & title",
            icon: <ChatTeardropTextIcon size={16} />,
          },
          {
            type: "contact" as StampType,
            label: "Contact & Resume Bar",
            desc: "Email copy + socials + PDF link",
            icon: <EnvelopeSimpleIcon size={16} />,
          },
          {
            type: "button" as StampType,
            label: "Action Button",
            desc: "Interactive CTA button",
            icon: <ToggleRightIcon size={16} />,
          },
        ].map((item) => (
          <Button
            className="group justify-between rounded-xl border-border/80 bg-muted/20 p-2.5 text-left hover:border-primary/50 hover:bg-muted/60"
            key={item.type}
            // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped stamp template
            onClick={() => handleAddStampQuick(item.type)}
            variant="ghost"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="rounded-lg border border-border bg-background p-2 text-primary transition-transform group-hover:scale-105">
                {item.icon}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {item.label}
                </div>
                <div className="truncate text-muted-foreground text-xxs">
                  {item.desc}
                </div>
              </div>
            </div>
            <PlusIcon
              className="text-muted-foreground transition-colors group-hover:text-primary"
              size={14}
            />
          </Button>
        ))}
      </div>
    </div>
  );
};
