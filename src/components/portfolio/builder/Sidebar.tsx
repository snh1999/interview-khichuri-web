import {
  CaretDownIcon,
  CaretRightIcon,
  ChatCircleDotsIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  FileCodeIcon,
  FileCssIcon,
  FileJsIcon,
  FolderIcon,
  LightningIcon,
  LockIcon,
  PaperPlaneRightIcon,
  PencilSimpleIcon,
  PlusIcon,
  RobotIcon,
  SparkleIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGenerateBuilder } from "@/api/portfolio";
import { AiActionButton } from "@/components/common/ai/AiActionButton.tsx";
import { selectBuilderContext } from "@/components/portfolio/builder/contextSelection";
import { ActionButton } from "@/components/ui/button/ActionButton";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useAppStore } from "@/store/appStore";
import {
  getActiveProject,
  useBuilderProject,
  useBuilderStore,
} from "@/store/useBuilderStore";

interface ISidebarTabBarProps {
  tab: "chat" | "files";
  fileCount: number;
  isCodePaneOpen: boolean;
  onChat: () => void;
  onFiles: () => void;
  onToggleCodePane: () => void;
}

const SidebarTabBar: React.FC<ISidebarTabBarProps> = ({
  tab,
  fileCount,
  isCodePaneOpen,
  onChat,
  onFiles,
  onToggleCodePane,
}) => (
  <div className="flex h-11 shrink-0 items-center justify-between gap-1.5 border-border border-b bg-card px-2">
    <div className="flex flex-1 rounded-lg border border-border bg-muted p-0.5">
      <button
        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1 font-medium text-xs transition ${
          tab === "chat"
            ? "bg-card text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={onChat}
        type="button"
      >
        <ChatCircleDotsIcon
          className={tab === "chat" ? "text-primary" : ""}
          size={15}
          weight={tab === "chat" ? "fill" : "regular"}
        />
        <span>AI Chat</span>
      </button>
      <button
        className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1 font-medium text-xs transition ${
          tab === "files"
            ? "bg-card text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={onFiles}
        type="button"
      >
        <FolderIcon
          className={tab === "files" ? "text-amber-500" : ""}
          size={15}
          weight={tab === "files" ? "fill" : "regular"}
        />
        <span>Files ({fileCount})</span>
      </button>
    </div>

    <Button
      className={
        isCodePaneOpen
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted text-foreground hover:bg-accent/80"
      }
      onClick={onToggleCodePane}
      size="sm"
      title={
        isCodePaneOpen ? "Hide code editor panel" : "Show code editor panel"
      }
      type="button"
      variant="ghost"
    >
      <CodeIcon size={13} weight={isCodePaneOpen ? "bold" : "regular"} />
      <span>{isCodePaneOpen ? "Hide" : "Code"}</span>
    </Button>
  </div>
);

export const Sidebar: React.FC = () => {
  const {
    isSidebarOpen,
    sidebarTab,
    files,
    activeFile,
    messages,
    isCodePaneOpen,
  } = useBuilderProject();
  const setSidebarTab = useBuilderStore((s) => s.setSidebarTab);
  const openFile = useBuilderStore((s) => s.openFile);
  const createFile = useBuilderStore((s) => s.createFile);
  const deleteFile = useBuilderStore((s) => s.deleteFile);
  const renameFile = useBuilderStore((s) => s.renameFile);
  const duplicateFile = useBuilderStore((s) => s.duplicateFile);
  const addMessage = useBuilderStore((s) => s.addMessage);
  const applyAiResult = useBuilderStore((s) => s.applyAiResult);
  const setCodePaneOpen = useBuilderStore((s) => s.setCodePaneOpen);

  const generateBuilder = useGenerateBuilder();
  const isGenerating = generateBuilder.isPending;

  const [inputPrompt, setInputPrompt] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [editingFilePath, setEditingFilePath] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState("");
  const [showConfigSection, setShowConfigSection] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const generateButtonRef = useRef<HTMLSpanElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // The AI action button owns its dialog, so "generate now" is a click on its
  // primary. Keeps the Enter shortcut and the canned quick prompts on one path.
  const clickGenerate = useCallback(() => {
    generateButtonRef.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.click();
  }, []);

  useEffect(() => {
    if (sidebarTab === "chat") {
      scrollToBottom();
    }
  }, [sidebarTab, scrollToBottom]);

  useEffect(() => {
    if (isCreatingFile) {
      setTimeout(() => newFileInputRef.current?.focus(), 50);
    }
  }, [isCreatingFile]);

  const runGeneration = async (
    promptText: string,
    provider: string,
    model?: string,
    instruction?: string
  ) => {
    setInputPrompt("");
    const projectId = useBuilderStore.getState().activePortfolioId;
    const { userId } = useAppStore.getState();
    addMessage({ sender: "user", content: promptText });

    try {
      const project = getActiveProject(useBuilderStore.getState());
      const baselineFiles = { ...project.files };
      const context = selectBuilderContext(project.files, {
        prompt: promptText,
        activeFile: project.activeFile,
        openFiles: project.openFiles,
      });
      const result = await generateBuilder.mutateAsync({
        prompt: promptText,
        files: context.files,
        manifest: context.manifest,
        provider,
        model,
        instruction,
      });
      if (useAppStore.getState().userId !== userId) {
        toast.info("AI result discarded: the signed-in account changed.");
        return;
      }
      applyAiResult(result, projectId ?? undefined, baselineFiles);
    } catch (err: unknown) {
      console.error("[Sidebar] Failed to generate code:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "AI generation failed. Please try again."
      );
    }
  };

  // One entry point for Enter, quick prompts and the missing-files action: seed
  // the prompt, then fire the AI action button's primary. When the prompt just
  // changed the button is still disabled until the new state renders, so defer
  // the click to the next frame.
  const handleGenerateRequest = (prompt: string) => {
    const promptText = prompt.trim();
    if (!promptText || isGenerating) {
      return;
    }
    if (promptText === inputPrompt.trim()) {
      clickGenerate();
      return;
    }
    setInputPrompt(promptText);
    requestAnimationFrame(clickGenerate);
  };

  const executeGenerate = (
    provider: string,
    model?: string,
    instruction?: string
  ) => runGeneration(inputPrompt, provider, model, instruction);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerateRequest(inputPrompt);
    }
  };

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      return;
    }

    let path = newFileName.trim();
    if (!path.includes(".")) {
      path += ".jsx";
    }
    const success = createFile(path);
    if (success) {
      setNewFileName("");
      setIsCreatingFile(false);
    }
  };

  const handleStartRename = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    setEditingFilePath(path);
    setEditingFileName(path.startsWith("/") ? path.slice(1) : path);
  };

  const handleSaveRename = (oldPath: string) => {
    if (!editingFileName.trim() || editingFileName === oldPath) {
      setEditingFilePath(null);
      return;
    }
    const success = renameFile(oldPath, editingFileName);
    if (success) {
      setEditingFilePath(null);
    }
  };
  const handleChatTab = () => setSidebarTab("chat");
  const handleFilesTab = () => setSidebarTab("files");
  const handleStartCreateFile = () => setIsCreatingFile(true);
  const handleToggleCodePane = () => setCodePaneOpen(!isCodePaneOpen);
  const handleNewFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewFileName(e.target.value);
  const handleCancelCreateFile = () => {
    setIsCreatingFile(false);
    setNewFileName("");
  };
  const handleEditingFileNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setEditingFileName(e.target.value);
  const handleCancelRename = () => setEditingFilePath(null);
  const handleStopPropagation = (e: React.MouseEvent) => e.stopPropagation();
  const handleToggleConfigSection = () =>
    setShowConfigSection(!showConfigSection);
  const handleInputPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setInputPrompt(e.target.value);

  const getFileIcon = (filename: string) => {
    if (
      filename.endsWith(".js") ||
      filename.endsWith(".jsx") ||
      filename.endsWith(".ts") ||
      filename.endsWith(".tsx")
    ) {
      return (
        <FileJsIcon
          className="shrink-0 text-amber-500"
          size={15}
          weight="fill"
        />
      );
    }
    if (filename.endsWith(".css")) {
      return (
        <FileCssIcon
          className="shrink-0 text-sky-500"
          size={15}
          weight="fill"
        />
      );
    }
    return (
      <FileCodeIcon className="shrink-0 text-muted-foreground" size={15} />
    );
  };

  const quickPrompts = [
    {
      label: "Navbar Header",
      prompt: "Create a responsive Navbar component and insert it at the top",
    },
    {
      label: "Pricing Cards",
      prompt:
        "Add a modern pricing section with monthly and annual pricing options",
    },
    {
      label: "FAQ Accordion",
      prompt: "Create an interactive FAQ accordion component",
    },
    {
      label: "Contact Form",
      prompt: "Add an interactive contact form section",
    },
    {
      label: "Testimonials",
      prompt: "Add a customer testimonials grid with ratings and reviews",
    },
  ];

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <aside className="z-20 flex h-full w-80 shrink-0 select-none flex-col border-border border-r bg-muted md:w-88">
      <SidebarTabBar
        fileCount={Object.keys(files).length}
        isCodePaneOpen={isCodePaneOpen}
        onChat={handleChatTab}
        onFiles={handleFilesTab}
        onToggleCodePane={handleToggleCodePane}
        tab={sidebarTab}
      />

      {sidebarTab === "files" && (
        <div className="flex flex-1 flex-col overflow-hidden bg-card">
          <div className="flex items-center justify-between border-border border-b bg-muted/50 p-2.5">
            <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
              Project Explorer
            </span>

            <div className="flex items-center gap-1">
              <Button
                onClick={handleStartCreateFile}
                size="sm"
                title="Create a new code file"
                type="button"
              >
                <PlusIcon size={12} weight="bold" />
                <span>New File</span>
              </Button>
            </div>
          </div>

          {isCreatingFile ? (
            <div className="border-border border-b bg-primary/5 p-3">
              <form className="space-y-2" onSubmit={handleCreateFileSubmit}>
                <div className="flex items-center gap-1.5">
                  <FileCodeIcon className="shrink-0 text-primary" size={16} />
                  <Input
                    className="flex-1 rounded-md border-border bg-card px-2.5 py-1 text-foreground text-xs"
                    onChange={handleNewFileNameChange}
                    placeholder="e.g. /components/Card.jsx"
                    ref={newFileInputRef}
                    value={newFileName}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground text-xxs">
                    <span>Quick:</span>
                    {[".jsx", ".js", ".css", ".json"].map((ext) => (
                      <Button
                        className="border-border bg-card font-mono"
                        key={ext}
                        // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped extension
                        onClick={() =>
                          setNewFileName((prev) => {
                            if (!prev) {
                              return `Component${ext}`;
                            }
                            const lastDotIdx = prev.lastIndexOf(".");
                            if (
                              lastDotIdx > 0 &&
                              lastDotIdx > prev.lastIndexOf("/")
                            ) {
                              return `${prev.slice(0, lastDotIdx)}${ext}`;
                            }
                            return `${prev}${ext}`;
                          })
                        }
                        size="xs"
                        type="button"
                        variant="ghost"
                      >
                        {ext}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      className="text-muted-foreground"
                      onClick={handleCancelCreateFile}
                      size="xs"
                      type="button"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={!newFileName.trim()}
                      size="xs"
                      type="submit"
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          ) : null}

          <div className="flex-1 space-y-3 overflow-y-auto p-2">
            <div>
              <div className="flex items-center justify-between px-2 py-1 font-bold text-muted-foreground text-xxs uppercase tracking-wider">
                <span>
                  Source Files (
                  {
                    Object.keys(files).filter(
                      (p) =>
                        !(
                          p.endsWith("package.json") ||
                          p.endsWith("vite.config.js") ||
                          p.endsWith("index.html")
                        )
                    ).length
                  }
                  )
                </span>
              </div>
              <div className="mt-0.5 space-y-0.5">
                {Object.keys(files)
                  .filter(
                    (p) =>
                      !(
                        p.endsWith("package.json") ||
                        p.endsWith("vite.config.js") ||
                        p.endsWith("index.html")
                      )
                  )
                  .map((filePath) => {
                    const isActive = activeFile === filePath;
                    const isEditing = editingFilePath === filePath;
                    const isRequiredEntry = filePath === "/App.js";

                    if (isEditing) {
                      return (
                        <div
                          className="flex items-center gap-1.5 rounded-md bg-muted p-1.5"
                          key={filePath}
                        >
                          <Input
                            autoFocus
                            className="flex-1 rounded border-border bg-card px-2 py-1 font-mono text-xs"
                            onChange={handleEditingFileNameChange}
                            // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped file path
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveRename(filePath);
                              }
                              if (e.key === "Escape") {
                                setEditingFilePath(null);
                              }
                            }}
                            value={editingFileName}
                          />
                          <Button
                            className="text-emerald-600 hover:bg-emerald-50"
                            // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped file path
                            onClick={() => handleSaveRename(filePath)}
                            size="icon-xs"
                            title="Save"
                            variant="ghost"
                          >
                            <CheckIcon weight="bold" />
                          </Button>
                          <Button
                            className="text-muted-foreground hover:bg-accent"
                            onClick={handleCancelRename}
                            size="icon-xs"
                            title="Cancel"
                            variant="ghost"
                          >
                            <XIcon />
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <div
                        className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                          isActive
                            ? "border border-border/80 bg-muted font-semibold text-foreground shadow-2xs"
                            : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        key={filePath}
                      >
                        <button
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 truncate pr-2 text-left"
                          // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped file path
                          onClick={() => openFile(filePath)}
                          type="button"
                        >
                          {getFileIcon(filePath)}
                          <span className="truncate font-mono text-[11.5px]">
                            {filePath}
                          </span>
                        </button>

                        <div className="flex shrink-0 items-center gap-1">
                          {isActive && (
                            <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.2 font-medium font-mono text-primary text-xxs">
                              active
                            </span>
                          )}

                          <div className="ml-1 hidden items-center gap-0.5 group-hover:flex">
                            <Button
                              className="text-muted-foreground transition hover:bg-accent hover:text-foreground"
                              // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped file path
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateFile(filePath);
                              }}
                              size="icon-xs"
                              title="Duplicate file"
                              variant="ghost"
                            >
                              <CopyIcon />
                            </Button>

                            {!isRequiredEntry && (
                              <>
                                <Button
                                  className="text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                  // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped file path
                                  onClick={(e) =>
                                    handleStartRename(e, filePath)
                                  }
                                  size="icon-xs"
                                  title="Rename file"
                                  variant="ghost"
                                >
                                  <PencilSimpleIcon />
                                </Button>
                                <ActionButton
                                  // biome-ignore lint/performance/noJsxPropsBind: inline action closes over the mapped file path
                                  action={() => {
                                    deleteFile(filePath);
                                    return Promise.resolve({ error: false });
                                  }}
                                  className="rounded p-1 text-muted-foreground transition hover:bg-red-100 hover:text-red-600"
                                  dialogDescription={`This will permanently delete "${filePath}". This action cannot be undone.`}
                                  dialogTitle="Delete File"
                                  onClick={handleStopPropagation}
                                  requireConfirmation
                                  title="Delete file"
                                  variant="ghost"
                                >
                                  <TrashIcon size={13} />
                                </ActionButton>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="border-border border-t pt-2">
              <button
                className="flex w-full cursor-pointer items-center justify-between rounded px-2 py-1 font-bold text-muted-foreground text-xxs uppercase tracking-wider transition hover:bg-muted/60 hover:text-foreground"
                onClick={handleToggleConfigSection}
                type="button"
              >
                <div className="flex items-center gap-1.5">
                  {showConfigSection ? (
                    <CaretDownIcon size={11} weight="bold" />
                  ) : (
                    <CaretRightIcon size={11} weight="bold" />
                  )}
                  <span>Project Setup & Config</span>
                </div>
                <span className="rounded border border-border bg-muted px-1.5 py-0.5 font-normal text-[9px] text-muted-foreground lowercase">
                  {showConfigSection ? "hide" : "view"}
                </span>
              </button>

              {showConfigSection ? (
                <div className="mt-1 space-y-0.5 pl-1">
                  {Object.keys(files)
                    .filter(
                      (p) =>
                        p.endsWith("package.json") ||
                        p.endsWith("vite.config.js") ||
                        p.endsWith("index.html")
                    )
                    .map((filePath) => {
                      const isActive = activeFile === filePath;
                      return (
                        <button
                          className={`group flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                            isActive
                              ? "border border-border/80 bg-muted font-semibold text-foreground shadow-2xs"
                              : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                          key={filePath}
                          // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped file path
                          onClick={() => openFile(filePath)}
                          type="button"
                        >
                          <div className="flex min-w-0 items-center gap-2 truncate pr-2">
                            {getFileIcon(filePath)}
                            <span className="truncate font-mono text-[11.5px]">
                              {filePath}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            {isActive && (
                              <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.2 font-medium font-mono text-primary text-xxs">
                                active
                              </span>
                            )}
                            <span
                              className="flex items-center gap-1 rounded border border-border/60 bg-muted px-1.5 py-0.5 text-muted-foreground text-xxs"
                              title="Project configuration file (read-only)"
                            >
                              <LockIcon size={10} />
                              <span>config</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center border-border border-t bg-muted p-2.5 text-muted-foreground text-xs">
            <span>{Object.keys(files).length} files in project</span>
          </div>
        </div>
      )}

      {sidebarTab === "chat" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 px-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                <LightningIcon
                  className="text-amber-500"
                  size={13}
                  weight="fill"
                />
                <span>Quick Code Generators</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((item) => (
                  <Button
                    className="rounded-lg hover:border-primary/40 hover:bg-primary/5"
                    disabled={isGenerating}
                    key={item.label}
                    // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped quick prompt
                    onClick={() => handleGenerateRequest(item.prompt)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <SparkleIcon className="text-primary" size={11} />
                    <span>{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="my-2 h-px bg-border" />

            {messages.map((msg) => (
              <div
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
                key={msg.id}
              >
                <div className="mb-1 flex items-center gap-1.5 px-1 text-muted-foreground text-xs">
                  {msg.sender === "user" ? (
                    <>
                      <span>You</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </>
                  ) : (
                    <>
                      <RobotIcon className="text-primary" size={13} />
                      <span className="font-medium text-muted-foreground">
                        AI Assistant
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </>
                  )}
                </div>

                <div
                  className={`max-w-[90%] rounded-xl p-3.5 text-xs leading-relaxed sm:text-[13px] ${
                    msg.sender === "user"
                      ? "rounded-br-xs bg-primary text-primary-foreground"
                      : "rounded-bl-xs border border-border bg-card text-foreground shadow-2xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.filesModified && msg.filesModified.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-border border-t pt-2">
                      <span className="text-muted-foreground text-xxs">
                        Created / Updated:
                      </span>
                      {msg.filesModified.map((f) => (
                        <Button
                          className="rounded border-primary/30 bg-primary/10 font-mono text-primary hover:bg-primary/20"
                          key={f}
                          // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped file path
                          onClick={() => openFile(f)}
                          size="xs"
                          title="Click to view file"
                          variant="ghost"
                        >
                          <FileCodeIcon />
                          {f}
                        </Button>
                      ))}
                    </div>
                  )}

                  {msg.missingFiles && msg.missingFiles.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-border border-t pt-2">
                      <span className="font-medium text-amber-600 text-xxs">
                        Missing:
                      </span>
                      {msg.missingFiles.map((f) => (
                        <span
                          className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-amber-600 text-xxs"
                          key={f}
                        >
                          {f}
                        </span>
                      ))}
                      <Button
                        disabled={isGenerating}
                        // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over this message's missing files
                        onClick={() =>
                          handleGenerateRequest(
                            `Create the missing files so the project runs again: ${msg.missingFiles?.join(", ")}`
                          )
                        }
                        size="xs"
                        type="button"
                      >
                        <SparkleIcon size={11} />
                        Generate missing files
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-border border-t bg-card p-3">
            <div className="relative flex flex-col">
              <Textarea
                className="resize-none rounded-lg border-border p-3 pr-10 text-foreground text-xs"
                disabled={isGenerating}
                onChange={handleInputPromptChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI to write code (e.g. 'Create a modern Navbar and Hero section')..."
                rows={3}
                value={inputPrompt}
              />

              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Press{" "}
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-xxs">
                    Enter
                  </kbd>{" "}
                  to generate
                </span>

                <span ref={generateButtonRef}>
                  <AiActionButton
                    description="Turn your prompt into project code files."
                    execute={executeGenerate}
                    executeDisabled={!inputPrompt.trim()}
                    executeLabel="Generate Code"
                    icon={<PaperPlaneRightIcon size={13} weight="bold" />}
                    isLoading={isGenerating}
                    size="sm"
                    title="Generate Code"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
