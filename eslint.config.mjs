/* eslint-disable import-x/no-rename-default, no-magic-numbers */
import core from "ultracite/eslint/core";
import react from "ultracite/eslint/react";
import reactRefresh from "eslint-plugin-react-refresh";
import reactPlugin from "eslint-plugin-react";
import { parser, plugin as tsPlugin } from "typescript-eslint";

// eslint-disable-next-line import-x/no-anonymous-default-export
export default [
  {
    ignores: ["src/components/ui/**", "*.mjs", "*.json", "*.config.ts"],
  },
  ...core,
  ...react,
  {
    files: ["src/api/**/*.{js,jsx,ts,tsx}", "src/lib/auth/auth-client.ts"],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser,
      parserOptions: {
        project: "./tsconfig.app.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "sonarjs/file-header": "off",
      "react/jsx-curly-newline": "off",
      "sonarjs/arrow-function-convention": "off",
      "github/filenames-match-regex": "off",
      "unicorn/filename-case": "off",
      "react-refresh/only-export-components": "warn",
      "react/jsx-indent": ["error", 2],
      "react/jsx-indent-props": ["error", 2],
      "id-length": "warn",
      "@typescript-eslint/init-declarations": "warn",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase", "snake_case"],
        },
      ],
    },
  },
];
