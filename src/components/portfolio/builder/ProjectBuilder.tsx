import type React from "react";
import { Sidebar } from "./Sidebar";
import { Workspace } from "./Workspace";

export const ProjectBuilder: React.FC = () => (
  <div className="bg-background text-foreground flex h-full w-full flex-col overflow-hidden font-mono">
    <div className="relative flex flex-1 overflow-hidden">
      <Sidebar />
      <Workspace />
    </div>
  </div>
);
