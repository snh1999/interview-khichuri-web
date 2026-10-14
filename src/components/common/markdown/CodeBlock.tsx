import { type ComponentProps, lazy, Suspense } from "react";

const HighlightedCode = lazy(() => import("./HighlightedCode"));

const LANGUAGE_REGEX = /language-(\w+)/;
const TRAILING_NEWLINE_REGEX = /\n$/;

export function CodeBlock({ className, children }: ComponentProps<"code">) {
  const match = LANGUAGE_REGEX.exec(className || "");
  if (!match) {
    return <code className={className}>{children}</code>;
  }

  return (
    <Suspense fallback={<code className={className}>{children}</code>}>
      <HighlightedCode
        code={String(children).replace(TRAILING_NEWLINE_REGEX, "")}
        lang={match[1]}
      />
    </Suspense>
  );
}
