import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BuilderProject,
  BuilderState,
  ChatMessage,
  DeviceMode,
  ProjectFiles,
  ViewMode,
} from "@/components/portfolio/builder.types";
import { formatTime } from "@/lib/date";
import {
  createPortfolioStorage,
  deleteStoredRow,
} from "@/lib/storage/portfolioDb";
import { generateSafeId } from "@/lib/utils";
import { downloadZip, generateProjectZip } from "@/lib/zipExporter";

const CAPITALIZED_NAME_REGEX = /^[A-Z]/;
const LOCAL_STORAGE_KEY = "ai_site_builder_project_data";
const APPLIED_EDIT_REGEX = /^(created|updated|deleted)\s+(.+)$/;

type TAppliedOp = "created" | "updated" | "deleted";

interface IAppliedEdit {
  op: TAppliedOp;
  path: string;
}

// `applied` entries are verb-prefixed ("updated /App.js"). Parse them once so
// the chat chips can open a real path (deletes have no file left to open) and
// the store can drop the server-side deletions from the merged project.
const parseAppliedEdits = (applied: string[]): IAppliedEdit[] =>
  applied.flatMap((entry) => {
    const match = APPLIED_EDIT_REGEX.exec(entry);
    if (!match) {
      return [];
    }
    return [{ op: match[1] as TAppliedOp, path: match[2] }];
  });

const EMPTY_PROJECT_FILES: ProjectFiles = {
  "/App.js": "export default function App() {\n  return null;\n}\n",
};

// Merge a server reply into the current files. `baselineFiles` is the content
// sent with the request; a file that no longer matches it was edited locally
// while the request ran, so the stale server copy is dropped instead of
// clobbering newer keystrokes. Deletions arrive only in `applied`.
const mergeAiFiles = (
  currentFiles: ProjectFiles,
  resultFiles: Record<string, string>,
  edits: IAppliedEdit[],
  baselineFiles?: Record<string, string>
): ProjectFiles => {
  const nextFiles = { ...currentFiles };
  for (const [path, content] of Object.entries(resultFiles)) {
    const baseline = baselineFiles?.[path];
    const editedInFlight =
      baseline !== undefined && currentFiles[path] !== baseline;
    if (!editedInFlight) {
      nextFiles[path] = content;
    }
  }
  for (const edit of edits) {
    if (edit.op === "deleted") {
      delete nextFiles[edit.path];
    }
  }
  return nextFiles;
};

const nowTime = (): string => formatTime(new Date());

export const createEmptyProject = (): BuilderProject => ({
  viewMode: "preview" as ViewMode,
  deviceMode: "desktop" as DeviceMode,
  sidebarTab: "chat",
  isSidebarOpen: true,
  isCodePaneOpen: false,
  activeFile: "/App.js",
  openFiles: ["/App.js"],
  files: EMPTY_PROJECT_FILES,
  messages: [],
  lastSaved: nowTime(),
});

// Stable reference returned for portfolios that have no code project yet, so a
// missing project never produces a fresh object on every render.
export const EMPTY_PROJECT: BuilderProject = createEmptyProject();

export const getActiveProject = (state: BuilderState): BuilderProject => {
  const id = state.activePortfolioId;
  return (id ? state.projects[id] : undefined) ?? EMPTY_PROJECT;
};

// A project "has files" once it holds more than the empty stub, i.e. something
// has been generated. Drives the create-vs-append choice and the replace warning.
export const projectHasFiles = (project: BuilderProject): boolean =>
  Object.keys(project.files).length > 1 ||
  project.files["/App.js"] !== EMPTY_PROJECT_FILES["/App.js"];

const patchProject = (
  state: BuilderState,
  patch: (project: BuilderProject) => BuilderProject
): Partial<BuilderState> => {
  const id = state.activePortfolioId;
  if (!id) {
    return {};
  }
  const current = state.projects[id] ?? createEmptyProject();
  return { projects: { ...state.projects, [id]: patch(current) } };
};

// Like `patchProject`, but targets an explicit project and never resurrects a
// dropped one — for async results that must land on the project that started them, not whichever is active when they resolve.
const patchProjectFor = (
  state: BuilderState,
  id: string | null,
  patch: (project: BuilderProject) => BuilderProject
): Partial<BuilderState> => {
  if (!id) {
    return {};
  }
  const current = state.projects[id];
  if (!current) {
    return {};
  }
  return { projects: { ...state.projects, [id]: patch(current) } };
};

// The subset of the builder store persisted to the `builderProjects` rows.
interface TBuilderPersisted {
  projects: Record<string, BuilderProject>;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      projects: {},
      activePortfolioId: null,

      setActivePortfolio: (id: string | null) => {
        set({ activePortfolioId: id });
      },

      ensureProject: (id: string) => {
        set((state) =>
          state.projects[id]
            ? {}
            : { projects: { ...state.projects, [id]: createEmptyProject() } }
        );
      },

      seedGeneratedFiles: (id: string, files: Record<string, string>) => {
        set((state) => {
          const base = state.projects[id] ?? createEmptyProject();
          const paths = Object.keys(files);
          const activeFile = files["/App.js"]
            ? "/App.js"
            : (paths[0] ?? base.activeFile);
          // Replacing the project drops its old files, so only carry over the
          // tabs that still exist in the new map.
          const openFiles = [...new Set([...base.openFiles, ...paths])].filter(
            (path) => files[path] !== undefined
          );
          return {
            activePortfolioId: id,
            projects: {
              ...state.projects,
              [id]: {
                ...base,
                files,
                activeFile,
                openFiles: openFiles.length ? openFiles : base.openFiles,
                lastSaved: nowTime(),
              },
            },
          };
        });
      },

      dropProject: (id: string) => {
        set((state) => {
          if (!state.projects[id]) {
            return {};
          }
          const projects = { ...state.projects };
          delete projects[id];
          return {
            projects,
            activePortfolioId:
              state.activePortfolioId === id ? null : state.activePortfolioId,
          };
        });
        // Rows are upsert-only, so dropping a project is an explicit delete.
        deleteStoredRow("builderProjects", id).catch((err) => {
          console.warn("[builderStore] dropProject persist failed:", err);
        });
      },

      cloneProject: (fromId: string, toId: string) => {
        set((state) => {
          const source = state.projects[fromId];
          // No source project: the copy starts blank, so there is nothing to do.
          if (!source) {
            return {};
          }
          const cloned = structuredClone(source);
          cloned.messages = [];
          cloned.lastSaved = nowTime();
          return { projects: { ...state.projects, [toId]: cloned } };
        });
      },

      setViewMode: (mode: ViewMode) => {
        set((state) => patchProject(state, (p) => ({ ...p, viewMode: mode })));
      },

      setDeviceMode: (mode: DeviceMode) => {
        set((state) =>
          patchProject(state, (p) => ({ ...p, deviceMode: mode }))
        );
      },

      setSidebarTab: (tab) => {
        set((state) => patchProject(state, (p) => ({ ...p, sidebarTab: tab })));
      },

      setCodePaneOpen: (isOpen: boolean) => {
        set((state) =>
          patchProject(state, (p) => ({
            ...p,
            isCodePaneOpen: isOpen,
            viewMode: isOpen ? "split" : "preview",
          }))
        );
      },

      toggleSidebar: () => {
        set((state) =>
          patchProject(state, (p) => ({
            ...p,
            isSidebarOpen: !p.isSidebarOpen,
          }))
        );
      },

      setActiveFile: (file: string) => {
        if (file && typeof file === "string") {
          set((state) =>
            patchProject(state, (p) => ({ ...p, activeFile: file }))
          );
        }
      },

      openFile: (file: string) => {
        if (!(file && typeof file === "string")) {
          return;
        }
        set((state) =>
          patchProject(state, (p) => ({
            ...p,
            activeFile: file,
            openFiles: p.openFiles.includes(file)
              ? p.openFiles
              : [...p.openFiles, file],
            isCodePaneOpen: true,
            viewMode: "split",
          }))
        );
      },

      closeFile: (file: string) => {
        set((state) =>
          patchProject(state, (p) => {
            const nextOpen = p.openFiles.filter((f) => f !== file);
            const nextActive =
              p.activeFile === file ? nextOpen[0] || "" : p.activeFile;
            return {
              ...p,
              openFiles: nextOpen,
              activeFile: nextActive,
              isCodePaneOpen: nextOpen.length > 0 ? p.isCodePaneOpen : false,
              viewMode: nextOpen.length === 0 ? "preview" : p.viewMode,
            };
          })
        );
      },

      updateFileContent: (path: string, content: string) => {
        if (!path || typeof path !== "string") {
          return;
        }
        set((state) =>
          patchProject(state, (p) => ({
            ...p,
            files: { ...p.files, [path]: content },
            lastSaved: nowTime(),
          }))
        );
      },

      // Seeds files streamed from the genesis flow, one file at a time as each
      // completes; merging (not replacing) keeps sibling files and lets the
      // preview compile incrementally.
      seedProjectFiles: (files, targetId) => {
        const seed = (p: BuilderProject): BuilderProject => {
          const nextOpen = [...p.openFiles];
          for (const path of Object.keys(files)) {
            if (!nextOpen.includes(path)) {
              nextOpen.push(path);
            }
          }
          return {
            ...p,
            files: { ...p.files, ...files },
            openFiles: nextOpen,
            activeFile: files["/App.js"] ? "/App.js" : p.activeFile,
            isCodePaneOpen: true,
            viewMode: "split",
            lastSaved: nowTime(),
          };
        };
        // Streamed chunks must land on the project that started the run, not
        // whichever portfolio is active when each chunk resolves. Unlike the
        // append path, genesis may target a project that does not exist yet.
        set((state) => {
          const id = targetId ?? state.activePortfolioId;
          if (!id) {
            return {};
          }
          const current = state.projects[id] ?? createEmptyProject();
          return { projects: { ...state.projects, [id]: seed(current) } };
        });
      },

      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
      createFile: (rawPath: string, initialContent?: string) => {
        // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
        if (!rawPath?.trim()) {
          toast.error("Please enter a valid file path");
          return false;
        }
        if (!get().activePortfolioId) {
          return false;
        }

        let normalizedPath = rawPath.trim();
        if (!normalizedPath.startsWith("/")) {
          normalizedPath = `/${normalizedPath}`;
        }

        const project = getActiveProject(get());
        if (normalizedPath in project.files) {
          toast.error(`File "${normalizedPath}" already exists`);
          return false;
        }

        let defaultContent = initialContent;
        if (defaultContent === undefined) {
          const fileNameWithoutExt =
            normalizedPath.split("/").pop()?.split(".")[0] || "Component";
          const capitalizedName =
            fileNameWithoutExt.charAt(0).toUpperCase() +
            fileNameWithoutExt.slice(1).replace(/[^a-zA-Z0-9]/g, "");

          if (
            normalizedPath.endsWith(".jsx") ||
            normalizedPath.endsWith(".tsx") ||
            (normalizedPath.endsWith(".js") &&
              capitalizedName.length > 0 &&
              CAPITALIZED_NAME_REGEX.test(capitalizedName))
          ) {
            defaultContent = `import React from 'react';

export default function ${capitalizedName || "CustomComponent"}() {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100">
      <h3 className="text-xl font-bold text-white mb-2">${capitalizedName || "Custom Component"}</h3>
      <p className="text-slate-400 text-sm">
        Start editing this component or import it into your main App.js.
      </p>
    </div>
  );
}
`;
          } else if (normalizedPath.endsWith(".css")) {
            defaultContent = `/* Custom Styles for ${normalizedPath} */
.custom-card {
  transition: all 0.2s ease-in-out;
}
.custom-card:hover {
  transform: translateY(-2px);
}
`;
          } else if (normalizedPath.endsWith(".json")) {
            defaultContent = `{\n  "title": "Custom Data",\n  "items": []\n}`;
          } else if (normalizedPath.endsWith(".html")) {
            defaultContent = `<div class="p-4 bg-slate-900 text-white rounded-xl">\n  <h2>Custom HTML Snippet</h2>\n</div>`;
          } else {
            defaultContent = `// File: ${normalizedPath}\nexport const helper = () => {\n  return true;\n};\n`;
          }
        }

        set((state) =>
          patchProject(state, (p) => ({
            ...p,
            files: { ...p.files, [normalizedPath]: defaultContent },
            activeFile: normalizedPath,
            openFiles: p.openFiles.includes(normalizedPath)
              ? p.openFiles
              : [...p.openFiles, normalizedPath],
            isCodePaneOpen: true,
            viewMode: "split",
            lastSaved: nowTime(),
          }))
        );

        toast.success(`Created "${normalizedPath}"`);
        return true;
      },

      deleteFile: (path: string) => {
        if (!path) {
          return;
        }
        if (path === "/App.js" || path === "/public/index.html") {
          toast.error(
            `"${path}" is a required project entry point and cannot be deleted.`
          );
          return;
        }

        if (!(path in getActiveProject(get()).files)) {
          return;
        }

        set((state) =>
          patchProject(state, (p) => {
            const updatedFiles = { ...p.files };
            delete updatedFiles[path];

            const nextOpen = p.openFiles.filter((f) => f !== path);
            const nextActive =
              p.activeFile === path
                ? nextOpen[0] || Object.keys(updatedFiles)[0] || ""
                : p.activeFile;

            return {
              ...p,
              files: updatedFiles,
              openFiles: nextOpen,
              activeFile: nextActive,
              isCodePaneOpen: nextOpen.length > 0 ? p.isCodePaneOpen : false,
              lastSaved: nowTime(),
            };
          })
        );

        toast.success(`Deleted "${path}"`);
      },

      renameFile: (oldPath: string, newPath: string) => {
        if (!(oldPath && newPath) || oldPath === newPath) {
          return false;
        }
        if (oldPath === "/App.js" || oldPath === "/public/index.html") {
          toast.error(
            `"${oldPath}" is a required project entry point and cannot be renamed.`
          );
          return false;
        }

        let normalizedNewPath = newPath.trim();
        if (!normalizedNewPath.startsWith("/")) {
          normalizedNewPath = `/${normalizedNewPath}`;
        }

        if (!get().activePortfolioId) {
          return false;
        }
        const project = getActiveProject(get());
        if (normalizedNewPath in project.files) {
          toast.error(`A file named "${normalizedNewPath}" already exists.`);
          return false;
        }

        const fileContent = project.files[oldPath];
        if (fileContent === undefined) {
          return false;
        }

        set((state) =>
          patchProject(state, (p) => {
            const updatedFiles = { ...p.files };
            delete updatedFiles[oldPath];
            updatedFiles[normalizedNewPath] = fileContent;

            const nextOpen = p.openFiles.map((f) =>
              f === oldPath ? normalizedNewPath : f
            );
            const nextActive =
              p.activeFile === oldPath ? normalizedNewPath : p.activeFile;

            return {
              ...p,
              files: updatedFiles,
              openFiles: nextOpen,
              activeFile: nextActive,
              lastSaved: nowTime(),
            };
          })
        );

        toast.success(`Renamed to "${normalizedNewPath}"`);
        return true;
      },

      duplicateFile: (path: string) => {
        const project = getActiveProject(get());
        const content = project.files[path];
        if (content === undefined) {
          return;
        }

        const parts = path.split(".");
        const ext = parts.length > 1 ? `.${parts.pop()}` : "";
        const base = parts.join(".");
        let copyPath = `${base}-copy${ext}`;
        let counter = 2;
        while (copyPath in project.files) {
          copyPath = `${base}-copy${counter}${ext}`;
          counter += 1;
        }

        get().createFile(copyPath, content);
      },

      addMessage: (messageData, projectId) => {
        const newMessage: ChatMessage = {
          id: generateSafeId("msg"),
          timestamp: nowTime(),
          ...messageData,
        };
        const patch = (p: BuilderProject): BuilderProject => ({
          ...p,
          messages: [...p.messages, newMessage],
        });
        set((state) =>
          projectId === undefined
            ? patchProject(state, patch)
            : patchProjectFor(state, projectId, patch)
        );
      },

      applyAiResult: (
        result: {
          files: Record<string, string>;
          message: string;
          applied: string[];
        },
        projectId?: string,
        baselineFiles?: Record<string, string>
      ): void => {
        if (projectId !== undefined && !get().projects[projectId]) {
          toast.info("AI result discarded: the project no longer exists.");
          return;
        }
        const edits = parseAppliedEdits(result.applied);
        const changedFiles = [
          ...new Set(
            edits
              .filter((edit) => edit.op !== "deleted")
              .map((edit) => edit.path)
          ),
        ];
        const patch = (project: BuilderProject): BuilderProject => {
          const nextFiles = mergeAiFiles(
            project.files,
            result.files,
            edits,
            baselineFiles
          );
          // Tab list follows the surviving files: a deleted file must not linger
          // open, and the active tab must fall back to a file that still exists.
          const nextOpen = project.openFiles.filter(
            (file) => file in nextFiles
          );
          for (const file of changedFiles) {
            if (file in nextFiles && !nextOpen.includes(file)) {
              nextOpen.push(file);
            }
          }

          return {
            ...project,
            files: nextFiles,
            openFiles: nextOpen,
            activeFile:
              changedFiles.find((file) => file in nextFiles) ??
              (project.activeFile in nextFiles
                ? project.activeFile
                : nextOpen[0]) ??
              project.activeFile,
            isCodePaneOpen: true,
            viewMode: "split",
            lastSaved: nowTime(),
          };
        };
        set((state) =>
          projectId === undefined
            ? patchProject(state, patch)
            : patchProjectFor(state, projectId, patch)
        );

        get().addMessage(
          {
            sender: "assistant",
            content: result.message,
            filesModified: changedFiles,
          },
          projectId
        );

        toast.success("AI code generated and compiled!");
      },

      // Append a generated multi-page design into the current project: reuse the
      // builder-merge path so existing routes survive and shared files (router/nav)
      // are updated in place.
      appendGeneratedFiles: (files, message, targetId) => {
        get().applyAiResult(
          {
            files,
            message,
            applied: Object.keys(files).map((path) => `created ${path}`),
          },
          targetId
        );
      },

      exportProject: (name?: string) => {
        try {
          const projectLabel = name?.trim() || "Portfolio Project";
          const allFiles = getActiveProject(get()).files;
          const zipBytes = generateProjectZip(projectLabel, allFiles);
          downloadZip(projectLabel, zipBytes);
          toast.success(
            "Project exported as standalone runnable .zip package!"
          );
        } catch (err) {
          console.error("Failed to export zip:", err);
          toast.error("Failed to generate project zip file");
        }
      },

      resetToDemo: () => {
        set((state) => {
          const id = state.activePortfolioId;
          if (!id) {
            return {};
          }
          return {
            projects: { ...state.projects, [id]: createEmptyProject() },
          };
        });
        toast.info("Project reset.");
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
      // Hydrated by `useLocalDataOnLogin` after it stamps the active user, so the
      // IDB rows read belong to the right account.
      skipHydration: true,
      storage: createPortfolioStorage<TBuilderPersisted>({
        store: "builderProjects",
        version: 0,
        items: (state) =>
          Object.entries(state.projects).map(([portfolioId, project]) => ({
            ...project,
            portfolioId,
          })) as unknown as Record<string, unknown>[],
        prefs: () => ({}),
        merge: (items) => ({
          projects: Object.fromEntries(
            items.map((item) => [
              item.portfolioId as string,
              item as unknown as BuilderProject,
            ])
          ),
        }),
      }),
      // The chat transcript is intentionally not persisted; files survive reload.
      partialize: (state) => ({
        projects: Object.fromEntries(
          Object.entries(state.projects).map(([id, project]) => [
            id,
            { ...project, messages: [] },
          ])
        ),
      }),
    }
  )
);

/**
 * Reactive selector returning the active portfolio's code project. Falls back to
 * a shared blank stub (stable reference) when the portfolio has no project yet.
 */
export const useBuilderProject = (): BuilderProject =>
  useBuilderStore((state) => getActiveProject(state));
