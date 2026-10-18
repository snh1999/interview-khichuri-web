import {
  ArrowUpRightIcon,
  CircleIcon,
  CreditCardIcon,
  FrameCornersIcon,
  ImageIcon,
  LineSegmentIcon,
  PencilSimpleLineIcon,
  SquareIcon,
  TextTIcon,
} from "@phosphor-icons/react";
import type { CanvasElement } from "../types";

export const getElementIcon = (el: CanvasElement) => {
  switch (el.type) {
    case "frame":
      return <FrameCornersIcon className="text-primary" size={14} />;
    case "image":
      return <ImageIcon className="text-muted-foreground" size={14} />;
    case "pen":
      return (
        <PencilSimpleLineIcon className="text-muted-foreground" size={14} />
      );
    case "rectangle":
      return <SquareIcon className="text-muted-foreground" size={14} />;
    case "ellipse":
      return <CircleIcon className="text-muted-foreground" size={14} />;
    case "line":
      return <LineSegmentIcon className="text-muted-foreground" size={14} />;
    case "arrow":
      return <ArrowUpRightIcon className="text-muted-foreground" size={14} />;
    case "text":
      return <TextTIcon className="text-foreground" size={14} />;
    case "stamp":
      return <CreditCardIcon className="text-muted-foreground" size={14} />;
    default:
      return <SquareIcon className="text-muted-foreground" size={14} />;
  }
};
