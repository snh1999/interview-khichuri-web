import type React from "react";
import { Sidebar } from "./Sidebar";
import { Workspace } from "./Workspace";

export const ProjectBuilder: React.FC = () => (
  <div className="flex h-full w-full flex-col overflow-hidden bg-background font-mono text-foreground">
    <div className="relative flex flex-1 overflow-hidden">
      <Sidebar />
      <Workspace />
    </div>
  </div>
);
