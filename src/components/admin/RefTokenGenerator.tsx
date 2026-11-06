import { CopyIcon } from "@phosphor-icons/react";
import { type ChangeEvent, type FormEvent, useCallback, useState } from "react";
import { useAdminGenerateRefToken } from "@/api/admin/feedback";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { copyText } from "@/lib/clipboard.ts";

// TODO: remove the reference-link generator and visit tracking end-to-end if
// they stay low value; it is isolated here so that removal stays cheap.
export const RefTokenGenerator = () => {
  const [text, setText] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const { data, isPending, mutate } = useAdminGenerateRefToken();

  const handleText = (event: ChangeEvent<HTMLInputElement>) =>
    setText(event.target.value);
  const handleBaseUrl = (event: ChangeEvent<HTMLInputElement>) =>
    setBaseUrl(event.target.value);

  const handleCopyToken = useCallback(() => {
    if (data) {
      copyText(data.token);
    }
  }, [data]);
  const handleCopyUrl = useCallback(() => {
    if (data) {
      copyText(data.url);
    }
  }, [data]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    mutate({ baseUrl: baseUrl.trim() || undefined, text: trimmed });
  };

  return (
    <form
      className="flex flex-col gap-3 rounded-md border p-4"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="font-heading font-semibold">Reference link generator</h2>
        <p className="text-muted-foreground text-sm">
          Create a trackable link. Each visit from the link records one row.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="grid min-w-56 flex-1 gap-1">
          <Label htmlFor="ref-text">Text</Label>
          <Input
            id="ref-text"
            onChange={handleText}
            placeholder="Where this link is used"
            required
            value={text}
          />
        </div>
        <div className="grid min-w-56 flex-1 gap-1">
          <Label htmlFor="ref-base-url">Base URL (optional)</Label>
          <Input
            id="ref-base-url"
            onChange={handleBaseUrl}
            placeholder="https://example.com"
            value={baseUrl}
          />
        </div>
        <AsyncButton isLoading={isPending} type="submit">
          Generate
        </AsyncButton>
      </div>

      {data ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              aria-label="Reference token"
              className="font-mono"
              readOnly
              value={data.token}
            />
            <Button
              aria-label="Copy token"
              onClick={handleCopyToken}
              size="sm"
              type="button"
              variant="outline"
            >
              <CopyIcon data-icon="inline-start" />
              Copy token
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input aria-label="Reference URL" readOnly value={data.url} />
            <Button
              aria-label="Copy URL"
              onClick={handleCopyUrl}
              size="sm"
              type="button"
              variant="outline"
            >
              <CopyIcon data-icon="inline-start" />
              Copy URL
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
};
