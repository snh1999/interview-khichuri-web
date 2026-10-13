import { CopySimpleIcon } from "@phosphor-icons/react";
import { MarkdownContent } from "@/components/common/MarkdownContent.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DrawLog,
  DrawLogBody,
  DrawLogClose,
  DrawLogContent,
  DrawLogDescription,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog.tsx";
import { copyText } from "@/lib/clipboard.ts";

export interface IAiResultDrawLogProps {
  description?: string;
  markdown?: string | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}

/**
 * Generic "show me the AI result" modal: a DrawLog that renders finished
 * markdown with a copy button in the header. Generation is fast, so it takes
 * the final result rather than a stream.
 */
export const AiResultDrawLog = ({
  description,
  markdown,
  onOpenChange,
  open,
  title,
}: Readonly<IAiResultDrawLogProps>) => (
  <DrawLog onOpenChange={onOpenChange} open={open}>
    <DrawLogContent className="gap-0" showCloseButton={false}>
      <DrawLogHeader className="mb-0">
        <div className="flex items-center justify-between gap-2">
          <DrawLogTitle className="flex items-center gap-2">
            <span className="truncate">{title}</span>
          </DrawLogTitle>
          {markdown ? (
            <Button
              aria-label={`Copy ${title}`}
              // biome-ignore lint/performance/noJsxPropsBind: <both are props>
              onClick={() => copyText(markdown)}
              size="sm"
              variant="outline"
            >
              <CopySimpleIcon className="size-4" /> Copy
            </Button>
          ) : null}
        </div>
        {description ? (
          <DrawLogDescription>{description}</DrawLogDescription>
        ) : null}
      </DrawLogHeader>

      <DrawLogBody>
        {markdown ? (
          <MarkdownContent content={markdown} style="typeset-docs" />
        ) : null}
      </DrawLogBody>

      <DrawLogFooter>
        <DrawLogClose render={<Button variant="outline">Close</Button>} />
      </DrawLogFooter>
    </DrawLogContent>
  </DrawLog>
);
