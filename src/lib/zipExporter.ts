import { strToU8, zipSync } from "fflate";
import type { ProjectFiles } from "@/components/portfolio/builder.types";

const TAILWIND_DIRECTIVE = /@tailwind\s+(?:base|components|utilities)\b/;
const STYLE_IMPORT_RE = /import\s+['"][^'"]*styles\.css['"]/;

/**
 * Normalizes Sandpack virtual file paths and packages everything
 * into a standalone, runnable React + Vite project zip buffer.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
export function generateProjectZip(
  projectName: string,
  files: ProjectFiles
): Uint8Array {
  const safeName =
    projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "portfolio-project";
  const zipData: Record<string, Uint8Array> = {};

  const packageJsonContent =
    files["/package.json"] ||
    JSON.stringify(
      {
        name: safeName,
        private: true,
        version: "0.1.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1",
          "react-router-dom": "^6.26.0",
          "lucide-react": "^0.475.0",
          "@phosphor-icons/react": "^2.1.7",
          clsx: "^2.1.1",
          "tailwind-merge": "^2.6.0",
        },
        devDependencies: {
          "@types/react": "^18.3.18",
          "@types/react-dom": "^18.3.5",
          "@vitejs/plugin-react": "^4.3.4",
          autoprefixer: "^10.4.20",
          postcss: "^8.5.1",
          tailwindcss: "^3.4.17",
          vite: "^6.1.0",
        },
      },
      null,
      2
    );

  let indexHtmlContent =
    files["/public/index.html"] ||
    files["/index.html"] ||
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

  if (
    !(
      indexHtmlContent.includes("/src/main.jsx") ||
      indexHtmlContent.includes("main.jsx")
    )
  ) {
    if (indexHtmlContent.includes("</body>")) {
      indexHtmlContent = indexHtmlContent.replace(
        "</body>",
        '  <script type="module" src="/src/main.jsx"></script>\n  </body>'
      );
    } else {
      indexHtmlContent +=
        '\n<script type="module" src="/src/main.jsx"></script>';
    }
  }

  const viteConfigContent =
    files["/vite.config.js"] ||
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The generator emits JSX components as .js (matching the sandbox); Vite
  // only parses JSX in .jsx by default, so point esbuild at src/*.js too.
  esbuild: { loader: 'jsx', include: /src\\/.*\\.jsx?$/, exclude: [] },
});
`;

  const styleImport = "import './styles.css';\n";
  // A supplied entry still needs the stylesheet the export writes, or the
  // downloaded site renders unstyled (the preview loads Tailwind separately).
  const withStyleImport = (entry: string): string =>
    STYLE_IMPORT_RE.test(entry) ? entry : `${styleImport}${entry}`;
  const providedEntry = files["/index.js"] || files["/src/main.jsx"];
  const mainJsxContent = providedEntry
    ? withStyleImport(providedEntry)
    : `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
${styleImport}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  const tailwindConfigContent =
    files["/tailwind.config.js"] ||
    `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

  const postcssConfigContent =
    files["/postcss.config.js"] ||
    `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

  const readmeContent = `# ${projectName}

Created with AI Portfolio & Website Builder.

## 🚀 Quick Start

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the local development server:
\`\`\`bash
npm run dev
\`\`\`

3. Build for production:
\`\`\`bash
npm run build
\`\`\`
`;

  zipData["package.json"] = strToU8(packageJsonContent);
  zipData["index.html"] = strToU8(
    indexHtmlContent.replace("/index.js", "/src/main.jsx")
  );
  zipData["vite.config.js"] = strToU8(viteConfigContent);
  zipData["tailwind.config.js"] = strToU8(tailwindConfigContent);
  zipData["postcss.config.js"] = strToU8(postcssConfigContent);
  zipData["README.md"] = strToU8(readmeContent);

  zipData["src/main.jsx"] = strToU8(mainJsxContent);

  const tailwindEntry =
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n";
  // The standalone project has no Tailwind CDN, so utilities only compile if a
  // stylesheet carries the directives. The preview's styles.css is stripped of
  // them, and a user stylesheet may never have had them, so ensure they exist.
  const withTailwind = (css: string): string =>
    TAILWIND_DIRECTIVE.test(css) ? css : `${tailwindEntry}${css}`;

  zipData["src/styles.css"] = strToU8(tailwindEntry);

  for (const [filePath, content] of Object.entries(files)) {
    // Skip virtual entries we handled explicitly
    if (
      filePath === "/package.json" ||
      filePath === "/public/index.html" ||
      filePath === "/index.html" ||
      filePath === "/index.js" ||
      filePath === "/vite.config.js"
    ) {
      continue;
    }

    let targetZipPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

    if (targetZipPath === "styles.css") {
      targetZipPath = "src/styles.css";
    } else if (targetZipPath === "main.jsx") {
      targetZipPath = "src/main.jsx";
    } else if (
      !(targetZipPath.startsWith("src/") || targetZipPath.startsWith("public/"))
    ) {
      // Keep the original filename (including the .js/.jsx extension) so the
      // project's own relative imports keep resolving; the scaffolded Vite
      // config parses JSX in both.
      targetZipPath = `src/${targetZipPath}`;
    }

    zipData[targetZipPath] =
      targetZipPath === "src/styles.css"
        ? strToU8(withTailwind(content))
        : strToU8(content);
  }

  return zipSync(zipData, { level: 6 });
}

/**
 * Triggers a browser download of the generated .zip file.
 */
export function downloadZip(projectName: string, zipBytes: Uint8Array): void {
  const safeName =
    projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "portfolio-project";
  const arrayBuffer = zipBytes.buffer.slice(
    zipBytes.byteOffset,
    zipBytes.byteOffset + zipBytes.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeName}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
