import {
  ArrowRightIcon,
  BriefcaseIcon,
  BrowsersIcon,
  CaretDownIcon,
  ChartBarIcon,
  ChatCircleTextIcon,
  CircleIcon,
  CodeIcon,
  CursorIcon,
  EnvelopeIcon,
  EraserIcon,
  GraduationCapIcon,
  HandIcon,
  ImageIcon,
  LineSegmentsIcon,
  ShapesIcon,
  SidebarSimpleIcon,
  SquareIcon,
  TableIcon,
  TagIcon,
  TextTIcon,
  UserIcon,
} from "@phosphor-icons/react";
import type React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateSafeId } from "@/lib/utils";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import type { FrameElement, StampType, ToolType } from "./types";
import { getEmptyFramePosition } from "./utils/framePlacement";
import { getCenteredViewport } from "./utils/viewport";
import { getNextZIndex } from "./utils/zIndex";

interface ToolItem {
  type: ToolType;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

export const Toolbar: React.FC = () => {
  const currentTool = useSketchBuilderStore((s) => s.currentTool);
  const setCurrentTool = useSketchBuilderStore((s) => s.setCurrentTool);
  const selectedStamp = useSketchBuilderStore((s) => s.selectedStamp);
  const setSelectedStamp = useSketchBuilderStore((s) => s.setSelectedStamp);
  const addElement = useSketchBuilderStore((s) => s.addElement);
  const selectElements = useSketchBuilderStore((s) => s.selectElements);
  const setViewport = useSketchBuilderStore((s) => s.setViewport);
  const currentPortfolio = useCurrentPortfolio();

  const handleAddArtboard = () => {
    const { theme } = currentPortfolio;
    const { x, y } = getEmptyFramePosition(currentPortfolio.elements);
    const title = "New Desktop Page";
    const newFrame: FrameElement = {
      id: generateSafeId("frame"),
      type: "frame",
      name: title,
      title,
      route: "/",
      preset: "desktop",
      x,
      y,
      width: 1040,
      height: 760,
      // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
      strokeColor: theme?.primaryColor || "#6366f1",
      // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
      fillColor: theme?.backgroundColor || "#ffffff",
      strokeWidth: 2,
      opacity: 1,
      zIndex: getNextZIndex(currentPortfolio.elements),
      // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
      background: theme?.backgroundColor || "#ffffff",
    };

    addElement(newFrame);
    selectElements([newFrame.id]);
    setViewport(getCenteredViewport(newFrame, currentPortfolio.viewport));
    setCurrentTool("select");
    toast.success(`Created artboard "${title}"`);
  };
  const handleToolbarMouseDown = (e: React.MouseEvent) => e.stopPropagation();
  const handleStampTool = () => setCurrentTool("stamp");
  const handleEraserTool = () => setCurrentTool("eraser");

  const tools: ToolItem[] = [
    {
      type: "select",
      label: "Select",
      shortcut: "V",
      icon: (
        <CursorIcon
          size={18}
          weight={currentTool === "select" ? "fill" : "regular"}
        />
      ),
    },
    {
      type: "hand",
      label: "Hand / Pan",
      shortcut: "H",
      icon: (
        <HandIcon
          size={18}
          weight={currentTool === "hand" ? "fill" : "regular"}
        />
      ),
    },
    // TODO: Pen/Freehand tool disabled per user requirement. Keep underlying element types/rendering in codebase for backward compatibility. DO NOT re-enable in UI or shortcuts without explicit user confirmation.
    // { type: 'pen', label: 'Pen / Freehand', shortcut: 'P', icon: <PencilSimple size={18} weight={currentTool === 'pen' ? 'fill' : 'regular'} /> },
    {
      type: "rectangle",
      label: "Rectangle",
      shortcut: "R",
      icon: (
        <SquareIcon
          size={18}
          weight={currentTool === "rectangle" ? "fill" : "regular"}
        />
      ),
    },
    {
      type: "ellipse",
      label: "Ellipse",
      shortcut: "O",
      icon: (
        <CircleIcon
          size={18}
          weight={currentTool === "ellipse" ? "fill" : "regular"}
        />
      ),
    },
    {
      type: "line",
      label: "Line",
      shortcut: "L",
      icon: (
        <LineSegmentsIcon
          size={18}
          weight={currentTool === "line" ? "fill" : "regular"}
        />
      ),
    },
    {
      type: "arrow",
      label: "Arrow",
      shortcut: "A",
      icon: (
        <ArrowRightIcon
          size={18}
          weight={currentTool === "arrow" ? "fill" : "regular"}
        />
      ),
    },
    {
      type: "text",
      label: "Text Block",
      shortcut: "T",
      icon: (
        <TextTIcon
          size={18}
          weight={currentTool === "text" ? "fill" : "regular"}
        />
      ),
    },
  ];

  const stamps: {
    type: StampType;
    label: string;
    group: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: "navbar",
      label: "Header / Navbar",
      group: "Portfolio Sections",
      icon: <BrowsersIcon size={15} />,
    },
    {
      type: "hero",
      label: "Hero Introduction",
      group: "Portfolio Sections",
      icon: <BrowsersIcon size={15} />,
    },
    {
      type: "project",
      label: "Project Showcase Card",
      group: "Portfolio Sections",
      icon: <CodeIcon size={15} />,
    },
    {
      type: "skills",
      label: "Skills & Tech Stack",
      group: "Portfolio Sections",
      icon: <GraduationCapIcon size={15} />,
    },
    {
      type: "experience",
      label: "Career Timeline",
      group: "Portfolio Sections",
      icon: <BriefcaseIcon size={15} />,
    },
    {
      type: "testimonial",
      label: "Client Testimonial",
      group: "Portfolio Sections",
      icon: <ChatCircleTextIcon size={15} />,
    },
    {
      type: "contact",
      label: "Contact Form Section",
      group: "Portfolio Sections",
      icon: <EnvelopeIcon size={15} />,
    },
    {
      type: "button",
      label: "Interactive Button",
      group: "Primitives",
      icon: <SquareIcon size={15} />,
    },
    {
      type: "input",
      label: "Input Field",
      group: "Primitives",
      icon: <SquareIcon size={15} />,
    },
    {
      type: "card",
      label: "Content Container Card",
      group: "Primitives",
      icon: <SquareIcon size={15} />,
    },
    {
      type: "avatar",
      label: "Profile Picture / Avatar",
      group: "Primitives",
      icon: <UserIcon size={15} />,
    },
    {
      type: "image",
      label: "Image Placeholder",
      group: "Primitives",
      icon: <ImageIcon size={15} />,
    },
    {
      type: "badge",
      label: "Skill Pill / Badge",
      group: "Primitives",
      icon: <TagIcon size={15} />,
    },
    {
      type: "table",
      label: "Data Grid / Table",
      group: "Primitives",
      icon: <TableIcon size={15} />,
    },
    {
      type: "sidebar",
      label: "Navigation Sidebar",
      group: "Primitives",
      icon: <SidebarSimpleIcon size={15} />,
    },
    {
      type: "stats",
      label: "Metrics / Numbers Stat",
      group: "Primitives",
      icon: <ChartBarIcon size={15} />,
    },
  ];

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: toolbar wrapper; the handler only stops clicks reaching the canvas beneath
    // biome-ignore lint/a11y/noStaticElementInteractions: toolbar wrapper; the handler only stops clicks reaching the canvas beneath
    <div
      className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-card/90 p-1 text-foreground shadow-xl backdrop-blur-md"
      onMouseDown={handleToolbarMouseDown}
    >
      {tools.map((t) => {
        const isActive = currentTool === t.type;
        return (
          <Tooltip key={t.type}>
            <TooltipTrigger
              render={
                <Button
                  aria-label={`${t.label} (${t.shortcut})`}
                  className="rounded-xl"
                  // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped tool
                  onClick={() => setCurrentTool(t.type)}
                  size="icon-lg"
                  variant={isActive ? "default" : "ghost"}
                >
                  {t.icon}
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={8}>
              <span>{t.label}</span>{" "}
              <span className="font-mono text-muted-foreground">
                [{t.shortcut}]
              </span>
            </TooltipContent>
          </Tooltip>
        );
      })}

      <div className="mx-0.5 h-6 w-px bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="UI Stamps Library"
              className="gap-1 rounded-xl"
              onClick={handleStampTool}
              size="lg"
              variant={currentTool === "stamp" ? "default" : "ghost"}
            >
              <ShapesIcon
                weight={currentTool === "stamp" ? "fill" : "regular"}
              />
              <CaretDownIcon />
            </Button>
          }
        />
        <DropdownMenuContent
          align="center"
          className="max-h-96 w-56 overflow-y-auto"
        >
          <DropdownMenuLabel className="text-xs">Layout</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 text-xs"
            onClick={handleAddArtboard}
          >
            <BrowsersIcon size={15} />
            <span>Artboard / Frame</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">
            Portfolio Wireframe Stamps
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {stamps.map((stamp) => (
            <DropdownMenuItem
              className={`${
                currentTool === "stamp" && selectedStamp === stamp.type
                  ? "bg-primary font-bold"
                  : ""
              }`}
              key={stamp.type}
              // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped stamp
              onClick={() => {
                setSelectedStamp(stamp.type);
                setCurrentTool("stamp");
              }}
            >
              {stamp.icon}
              <span>{stamp.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label="Eraser (E)"
              className="rounded-xl"
              onClick={handleEraserTool}
              size="icon-lg"
              variant={currentTool === "eraser" ? "destructive" : "ghost"}
            >
              <EraserIcon
                weight={currentTool === "eraser" ? "fill" : "regular"}
              />
            </Button>
          }
        />
        <TooltipContent side="bottom" sideOffset={8}>
          <span>Eraser</span>{" "}
          <span className="font-mono text-muted-foreground">[E]</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
