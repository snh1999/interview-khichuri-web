import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { useResumeViewUrl } from "@/api/resumes";
import { Button } from "@/components/ui/button.tsx";

export const OpenPDFInNewTab = ({
  resumeId,
}: Readonly<{ resumeId: string }>) => {
  const { data } = useResumeViewUrl(resumeId);

  const handleOpen = () => {
    if (data) {
      window.open(data.url, "_blank");
    }
  };

  return (
    <Button disabled={!data} onClick={handleOpen} size="sm" variant="ghost">
      <ArrowSquareOutIcon className="size-4" />
      Open PDF
    </Button>
  );
};
