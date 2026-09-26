import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { getSystemTheme } from "@/lib/utils.ts";
import { useThemeStore } from "@/store/themeStore.ts";

interface IProps {
  code: string;
  lang: string;
}

export default function HighlightedCode({ code, lang }: Readonly<IProps>) {
  const theme = useThemeStore((state) => state.theme);
  const [html, setHtml] = useState<string | null>(null);

  const resolved = theme === "system" ? getSystemTheme() : theme;
  const shikiTheme = resolved === "dark" ? "github-dark" : "github-light";

  useEffect(() => {
    let active = true;
    codeToHtml(code, {
      lang,
      theme: shikiTheme,
    } as Parameters<typeof codeToHtml>[1]).then((result) => {
      if (active) {
        setHtml(result);
      }
    });
    return () => {
      active = false;
    };
  }, [code, lang, shikiTheme]);

  if (!html) {
    return <code>{code}</code>;
  }
  // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki-generated highlighted markup
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
