import {
  CreditCardIcon,
  DesktopIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
} from "@phosphor-icons/react";
import type React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateSafeId } from "@/lib/utils";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import type { FrameElement } from "../types";
import { getEmptyFramePosition } from "../utils/framePlacement";
import { getCenteredViewport } from "../utils/viewport";

export const AddFramePresets: React.FC = () => {
  const addElement = useSketchBuilderStore((s) => s.addElement);
  const selectElements = useSketchBuilderStore((s) => s.selectElements);
  const setViewport = useSketchBuilderStore((s) => s.setViewport);
  const setCurrentTool = useSketchBuilderStore((s) => s.setCurrentTool);
  const currentPortfolio = useCurrentPortfolio();
  const { elements } = currentPortfolio;

  const handleAddFramePreset = (
    preset: "desktop" | "mobile" | "tablet" | "card"
  ) => {
    let width = 1040;
    let height = 760;
    let title = "New Desktop Page";
    let route = "/";

    if (preset === "mobile") {
      width = 375;
      height = 720;
      title = "Mobile View";
      route = "/";
    } else if (preset === "tablet") {
      width = 768;
      height = 960;
      title = "Tablet View";
      route = "/";
    } else if (preset === "card") {
      width = 420;
      height = 540;
      title = "Project Detail Modal";
      route = "/project-modal";
    }

    const nextX = getEmptyFramePosition(elements).x;

    const newFrame: FrameElement = {
      id: generateSafeId("frame"),
      type: "frame",
      name: title,
      title,
      route,
      preset,
      x: nextX,
      y: 60,
      width,
      height,
      strokeColor: currentPortfolio.theme.primaryColor || "#6366f1",
      fillColor: currentPortfolio.theme.backgroundColor || "#ffffff",
      strokeWidth: 2,
      opacity: 1,
      zIndex: 1,
      background: currentPortfolio.theme.backgroundColor || "#ffffff",
    };

    addElement(newFrame);
    selectElements([newFrame.id]);
    setViewport(getCenteredViewport(newFrame, currentPortfolio.viewport));
    setCurrentTool("select");
    toast.success(`Created artboard "${title}"`);
  };
  const handleAddDesktopFrame = () => handleAddFramePreset("desktop");
  const handleAddMobileFrame = () => handleAddFramePreset("mobile");
  const handleAddTabletFrame = () => handleAddFramePreset("tablet");
  const handleAddCardFrame = () => handleAddFramePreset("card");

  return (
    <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-primary text-xxs uppercase tracking-wider">
          + Add Artboard Frame
        </span>
        <span className="text-muted-foreground text-xxs">Presets</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Button
          className="justify-start rounded-lg bg-background hover:bg-muted"
          onClick={handleAddDesktopFrame}
          size="lg"
          variant="outline"
        >
          <DesktopIcon className="mr-1 shrink-0 text-primary" size={13} />
          <span className="truncate">Desktop (1040)</span>
        </Button>
        <Button
          className="justify-start rounded-lg bg-background hover:bg-muted"
          onClick={handleAddMobileFrame}
          size="lg"
          variant="outline"
        >
          <DeviceMobileIcon className="mr-1 shrink-0 text-primary" size={13} />
          <span className="truncate">Mobile (375)</span>
        </Button>
        <Button
          className="justify-start rounded-lg bg-background hover:bg-muted"
          onClick={handleAddTabletFrame}
          size="lg"
          variant="outline"
        >
          <DeviceTabletIcon className="mr-1 shrink-0 text-primary" size={13} />
          <span className="truncate">Tablet (768)</span>
        </Button>
        <Button
          className="justify-start rounded-lg bg-background hover:bg-muted"
          onClick={handleAddCardFrame}
          size="lg"
          variant="outline"
        >
          <CreditCardIcon className="mr-1 shrink-0 text-primary" size={13} />
          <span className="truncate">Modal / Card</span>
        </Button>
      </div>
    </div>
  );
};
