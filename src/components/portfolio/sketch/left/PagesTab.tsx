import type React from "react";
import { AddFramePresets } from "./AddFramePresets";
import { FrameTree } from "./FrameTree";
import { LooseElements } from "./LooseElements";

export const PagesTab: React.FC = () => (
  <div className="flex-1 space-y-4 overflow-y-auto p-3 text-xs">
    <AddFramePresets />
    <FrameTree />
    <LooseElements />
  </div>
);
