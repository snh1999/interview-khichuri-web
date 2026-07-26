import {
  CloudArrowUpIcon,
  FilePdfIcon,
  SpinnerIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { MAX_RESUMES } from "@/app.constants.ts";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

interface IProps {
  count: number;
  isUploading: boolean;
  onUpload: (file: File, name?: string) => void;
}

export const UploadResume = ({
  count,
  isUploading,
  onUpload,
}: Readonly<IProps>) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");

  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasUploadingRef = useRef(false);

  useEffect(() => {
    if (wasUploadingRef.current && !isUploading) {
      setSelectedFile(null);
      setName("");
    }
    wasUploadingRef.current = isUploading;
  }, [isUploading]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      e.target.value = "";
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast.error("Invalid file type, only PDF files are allowed!");
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      onUpload(selectedFile, name || undefined);
    }
  }, [selectedFile, name, onUpload]);

  const hasQuota = count < MAX_RESUMES;

  return (
    <>
      <Input
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleInputChange}
        ref={inputRef}
        type="file"
      />
      {selectedFile && hasQuota ? (
        <Card className="h-full">
          <CardHeader className="flex items-center gap-2 pt-2 text-sm">
            <FilePdfIcon className="size-5 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{selectedFile.name}</span>
            <Button
              disabled={isUploading}
              onClick={() => {
                setSelectedFile(null);
                setName("");
              }}
              size="sm"
              variant="outline"
            >
              Change
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-end space-y-4 pt-3">
            <div className="w-full space-y-3">
              <Label>File name (optional)</Label>
              <Input
                disabled={isUploading}
                onChange={(e) => setName(e.target.value)}
                placeholder="Renamed file"
                value={name}
              />
            </div>

            <AsyncButton isLoading={isUploading} onClick={handleUpload}>
              Upload Resume
            </AsyncButton>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`flex flex-col items-center gap-3 rounded-lg border-2 border-muted-foreground/25 border-dashed p-8 transition-colors ${
            isDragOver ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => inputRef.current?.click()}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              inputRef.current?.click();
            }
          }}
          tabIndex={0}
        >
          {isUploading ? (
            <SpinnerIcon className="size-8 animate-spin text-muted-foreground" />
          ) : (
            <CloudArrowUpIcon className="size-8 text-muted-foreground" />
          )}
          <div className="flex flex-col items-center gap-1">
            <p className="font-medium text-sm">
              {isUploading
                ? "Uploading..."
                : "Click to upload or drag and drop"}
            </p>
            <p className="text-muted-foreground text-xs">
              PDF only, maximum 5MB ({count}/{MAX_RESUMES})
            </p>
          </div>
          <Button
            disabled={isUploading}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            variant="outline"
          >
            Select From files
          </Button>
        </Card>
      )}

      {hasQuota ? null : (
        <Card className="flex flex-col items-center gap-3">
          <CardContent className="flex min-h-40 flex-col items-center justify-center space-y-1">
            <WarningIcon className="size-10 text-destructive" />
            <p className="text-destructive">
              You have already reached the limit of {MAX_RESUMES} resumes.
            </p>
            <p>Remove at least one resume to continue uploading.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
};
