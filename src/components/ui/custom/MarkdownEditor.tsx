import MDEditor from "@uiw/react-md-editor";
import type { ICommonInputValues } from "@/components/common/form/form.types.ts";
import { getSystemTheme } from "@/lib/utils.ts";
import { useThemeStore } from "@/store/themeStore.ts";

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
      <MDEditor
        className="p-1"
        autoFocus={autoFocus ?? false}
        height={height}
        onChange={handleChange}
        textareaProps={{
          disabled,
          id: name,
          name,
          onBlur,
          placeholder,
        }}
        value={value}
      />
    </div>
  );
};
