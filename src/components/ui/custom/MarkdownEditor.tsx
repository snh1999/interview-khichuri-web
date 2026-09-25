import { lazy, Suspense } from "react";
import type { ICommonInputValues } from "@/components/common/form/form.types.ts";
import { CodeBlock } from "@/components/common/markdown/CodeBlock.tsx";
import { getSystemTheme } from "@/lib/utils.ts";
import { useThemeStore } from "@/store/themeStore.ts";

const MDEditor = lazy(() => import("@uiw/react-md-editor"));

interface IMarkdownEditorProps extends ICommonInputValues {
  invalid?: boolean;
  value: string;
  name?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  height?: number | string;
}

export const MarkdownEditor = ({
  placeholder,
  disabled,
  autoFocus,
  invalid,
  value,
  name,
  onBlur,
  onChange,
  height = 200,
}: Readonly<IMarkdownEditorProps>) => {
  const theme = useThemeStore((state) => state.theme);

  const handleChange = (next?: string): void => {
    onChange(next ?? "");
  };

  return (
    <div
      className="md-editor-wrap border w-full"
      data-color-mode={theme === "system" ? getSystemTheme() : theme}
      data-invalid={invalid}
    >
      <Suspense
        fallback={
          <textarea
            aria-label={name}
            className="w-full resize-y bg-transparent p-2 font-mono text-sm"
            disabled={disabled}
            id={name}
            name={name}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            style={{ height }}
            value={value}
          />
        }
      >
        <MDEditor
          className="p-1"
          autoFocus={autoFocus ?? false}
          height={height}
          onChange={handleChange}
          previewOptions={{ components: { code: CodeBlock } }}
          textareaProps={{
            disabled,
            id: name,
            name,
            onBlur,
            placeholder,
          }}
          value={value}
        />
      </Suspense>
    </div>
  );
};
