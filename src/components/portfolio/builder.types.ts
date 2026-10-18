export type ViewMode = "preview" | "code" | "split";
export type DeviceMode = "desktop" | "tablet" | "mobile";
export type SidebarTab = "chat" | "files";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  filesModified?: string[];
  /** Planned files that failed to generate; lets the UI offer a one-click repair. */
  missingFiles?: string[];
}

export interface ProjectFiles {
  [path: string]: string;
}

/**
 * One portfolio's editable code project. Messages are deliberately in-memory
 * only (stripped by `partialize`) — the transcript is not persisted.
 */
export interface BuilderProject {
  viewMode: ViewMode;
  deviceMode: DeviceMode;
  sidebarTab: SidebarTab;
  isSidebarOpen: boolean;
  isCodePaneOpen: boolean;
  activeFile: string;
  openFiles: string[];
  files: ProjectFiles;
  messages: ChatMessage[];
  lastSaved: string | null;
}

export interface BuilderState {
  /** Code projects keyed by portfolio id; a missing entry reads as a blank stub. */
  projects: Record<string, BuilderProject>;
  activePortfolioId: string | null;

  setActivePortfolio: (id: string | null) => void;
  ensureProject: (id: string) => void;
  seedGeneratedFiles: (id: string, files: Record<string, string>) => void;
  dropProject: (id: string) => void;
  cloneProject: (fromId: string, toId: string) => void;

  setViewMode: (mode: ViewMode) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setCodePaneOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setActiveFile: (file: string) => void;
  openFile: (file: string) => void;
  closeFile: (file: string) => void;
  updateFileContent: (path: string, content: string) => void;
  seedProjectFiles: (files: Record<string, string>) => void;
  createFile: (path: string, content?: string) => boolean;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => boolean;
  duplicateFile: (path: string) => void;
  addMessage: (
    message: Omit<ChatMessage, "id" | "timestamp">,
    projectId?: string
  ) => void;
  applyAiResult: (
    result: {
      files: Record<string, string>;
      message: string;
      applied: string[];
    },
    projectId?: string
  ) => void;
  appendGeneratedFiles: (
    files: Record<string, string>,
    message: string
  ) => void;
  exportProject: (name?: string) => void;
  resetToDemo: () => void;
}
