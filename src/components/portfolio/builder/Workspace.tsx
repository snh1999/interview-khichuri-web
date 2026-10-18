import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { FileCodeIcon, LockIcon, XIcon } from "@phosphor-icons/react";
import React from "react";
import { Button } from "@/components/ui/button.tsx";
import { sanitizeSandpackFiles } from "@/lib/sandpack.ts";
import { useBuilderProject, useBuilderStore } from "@/store/useBuilderStore";

const SandpackStoreSync: React.FC = () => {
  const { sandpack } = useSandpack();
  const updateFileContent = useBuilderStore((s) => s.updateFileContent);
  const { activeFile, files } = useBuilderProject();
  // Latest sandbox content per path, so a file switch or unmount can flush what
  // the debounce has not written yet. Sandpack content is only pushed into the store here — nothing else does.
  const pendingRef = React.useRef<Map<string, string>>(new Map());
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const sandpackRef = React.useRef(sandpack.files);
  sandpackRef.current = sandpack.files;

  const flushPath = React.useCallback(
    (path: string) => {
      const timer = timersRef.current.get(path);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(path);
      }
      const pending = pendingRef.current.get(path);
      if (pending === undefined) {
        return;
      }
      pendingRef.current.delete(path);
      // Drop the write if the sandbox no longer holds this content (an external re-sync, e.g. an AI merge, already won) or the store caught up.
      if (sandpackRef.current[path]?.code !== pending) {
        return;
      }
      updateFileContent(path, pending);
    },
    [updateFileContent]
  );

  React.useEffect(() => {
    const currentCode = sandpack.files[activeFile]?.code;
    const currentStoreCode = files[activeFile];

    if (currentCode !== undefined && currentCode !== currentStoreCode) {
      pendingRef.current.set(activeFile, currentCode);
      const timer = timersRef.current.get(activeFile);
      if (timer) {
        clearTimeout(timer);
      }
      timersRef.current.set(
        activeFile,
        setTimeout(() => flushPath(activeFile), 350)
      );
    }
    // No cleanup: the per-path timer must survive an active-file switch.
  }, [sandpack.files, activeFile, files, flushPath]);

  // Last chance flush when the workspace goes away (route change, canvas tab).
  React.useEffect(
    () => () => {
      for (const path of [...pendingRef.current.keys()]) {
        flushPath(path);
      }
    },
    [flushPath]
  );

  return null;
};

export const Workspace: React.FC = () => {
  const { files, activeFile, openFiles, viewMode, deviceMode } =
    useBuilderProject();
  const closeFile = useBuilderStore((s) => s.closeFile);
  const openFile = useBuilderStore((s) => s.openFile);

  // Older saved projects may still carry a Tailwind import the sandbox cannot
  // resolve; clean it for the preview (SandpackStoreSync writes it back).
  const sandpackFiles = React.useMemo(
    () => sanitizeSandpackFiles(files),
    [files]
  );

  const getDeviceWidthClass = () => {
    switch (deviceMode) {
      case "mobile":
        return "w-[375px] max-w-[375px] h-[680px] max-h-[92%] my-auto shadow-2xl rounded-3xl border-8 border-border overflow-hidden shrink-0";
      case "tablet":
        return "w-[768px] max-w-[768px] h-[92%] my-auto shadow-2xl rounded-2xl border-8 border-border overflow-hidden shrink-0";
      default:
        return "w-full h-full";
    }
  };

  const getFileName = (path: string) => {
    const parts = path.split("/");
    return parts.at(-1) || path;
  };

  const isEditorVisible = viewMode === "code" || viewMode === "split";
  const isPreviewVisible = viewMode === "preview" || viewMode === "split";

  return (
    <main className="flex h-full flex-1 flex-col overflow-hidden bg-background">
      <SandpackProvider
        className="flex h-full flex-1 flex-col"
        customSetup={{
          dependencies: {
            "lucide-react": "^0.475.0",
            clsx: "latest",
            "tailwind-merge": "latest",
            "react-router-dom": "^6.26.0",
          },
        }}
        files={sandpackFiles}
        options={{
          activeFile,
          visibleFiles: openFiles,
          recompileMode: "delayed",
          recompileDelay: 300,
          externalResources: ["https://cdn.tailwindcss.com"],
        }}
        template="react"
        theme="light"
      >
        <SandpackStoreSync />
        <div className="flex h-full w-full flex-1 overflow-hidden">
          {isEditorVisible ? (
            <div
              className={`flex h-full flex-col border-border border-r bg-card ${
                viewMode === "split" ? "w-1/2" : "w-full"
              }`}
            >
              {openFiles.length > 0 && (
                <div className="no-scrollbar flex shrink-0 items-center overflow-x-auto border-border border-b bg-muted">
                  {openFiles.map((filePath) => {
                    const isActive = activeFile === filePath;
                    const isConfigFile =
                      filePath.endsWith("package.json") ||
                      filePath.endsWith("vite.config.js") ||
                      filePath.endsWith("index.html");
                    return (
                      <div
                        className={`flex select-none items-center gap-2 border-border border-r px-3 py-2 text-xs transition ${
                          isActive
                            ? "border-t-2 border-t-primary bg-card font-medium text-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                        key={filePath}
                      >
                        <button
                          className="flex cursor-pointer items-center gap-2 text-left"
                          // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped file path
                          onClick={() => openFile(filePath)}
                          type="button"
                        >
                          <FileCodeIcon
                            className={
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                            }
                            size={14}
                          />
                          <span className="max-w-[120px] truncate">
                            {getFileName(filePath)}
                          </span>
                        </button>
                        {isConfigFile ? (
                          <span
                            className="inline-flex items-center"
                            title="Read-only project configuration"
                          >
                            <LockIcon
                              className="text-muted-foreground"
                              size={11}
                            />
                          </span>
                        ) : null}
                        {openFiles.length > 1 && (
                          <Button
                            className="text-muted-foreground hover:bg-accent hover:text-foreground"
                            // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped file path
                            onClick={() => closeFile(filePath)}
                            size="icon-xs"
                            variant="ghost"
                          >
                            <XIcon />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="relative flex-1 overflow-hidden font-mono text-xs">
                {activeFile &&
                  (activeFile.endsWith("package.json") ||
                    activeFile.endsWith("vite.config.js") ||
                    activeFile.endsWith("index.html")) && (
                    <div className="z-10 flex items-center justify-between border-border border-b bg-muted/80 px-3 py-1 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1.5 font-sans">
                        <LockIcon className="text-muted-foreground" size={12} />
                        <span>
                          Project system configuration (read-only reference)
                        </span>
                      </span>
                      <span className="font-mono text-muted-foreground text-xxs">
                        Included in exported .zip
                      </span>
                    </div>
                  )}
                <SandpackLayout className="h-full rounded-none border-none">
                  <SandpackCodeEditor
                    closableTabs={false}
                    readOnly={
                      activeFile.endsWith("package.json") ||
                      activeFile.endsWith("vite.config.js") ||
                      activeFile.endsWith("index.html")
                    }
                    showInlineErrors={true}
                    showLineNumbers={true}
                    showTabs={false}
                    style={{ height: "100%", width: "100%" }}
                    wrapContent={true}
                  />
                </SandpackLayout>
              </div>
            </div>
          ) : null}

          {isPreviewVisible ? (
            <div
              className={`relative flex h-full flex-col items-center justify-center overflow-hidden bg-muted p-2 ${
                viewMode === "split" ? "w-1/2" : "w-full"
              }`}
            >
              <div
                className={`flex flex-col transition-all duration-300 ${getDeviceWidthClass()}`}
              >
                <SandpackLayout className="h-full w-full rounded-none border-none bg-white">
                  <SandpackPreview
                    showNavigator={false}
                    showOpenInCodeSandbox={false}
                    showRefreshButton={true}
                    style={{ height: "100%", width: "100%" }}
                  />
                </SandpackLayout>
              </div>
            </div>
          ) : null}
        </div>
      </SandpackProvider>
    </main>
  );
};
