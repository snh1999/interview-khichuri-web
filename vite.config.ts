import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    testTimeout: 15_000,
    coverage: {
      exclude: [
        "coverage/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
        "src/components/ui/**",
        // TODO(portfolio-tests): remove this whole block — it exists only while
        // the portfolio suites are deferred to the test PR. Each entry below is
        // portfolio code whose suite lands separately; once it does, drop it here.
        "src/store/sketchBuilderStore.ts",
        "src/store/useBuilderStore.ts",
        "src/lib/storage/portfolioDb.ts",
        "src/lib/storage/imageStorageDb.ts",
        "src/lib/zipExporter.ts",
        "src/components/portfolio/sketch/types.ts",
        "src/components/portfolio/sketch/utils/containment.ts",
        "src/components/portfolio/builder.types.ts",
        "src/components/portfolio/PortfolioListView.tsx",
        "src/components/portfolio/PortfolioListItem.tsx",
        "src/components/portfolio/PortfolioCreateDialog.tsx",
        "src/components/portfolio/sketch/SketchNavbar.tsx",
        "src/components/portfolio/builder/ProjectBuilder.tsx",
        "src/components/portfolio/builder/Sidebar.tsx",
        "src/components/portfolio/builder/Workspace.tsx",
        "src/components/portfolio/builder/contextSelection.ts",
        "src/lib/sandpack.ts",
        "src/api/portfolio/index.ts",
        "src/pages/PortfolioEditorPage.tsx",
        "src/pages/PortfolioSketchPage.tsx",
      ],
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },
  },
});
