import type { IResume } from "@/api/resumes";
import { useResumeViewUrl } from "@/api/resumes";
import { GeneratedResumePreview } from "@/components/resume/job-profile/GeneratedResumePreview.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

interface IViewResumeProps {
  resume: IResume;
}

export const ViewResumeContent = ({ resume }: Readonly<IViewResumeProps>) => {
  const isGenerated = Boolean(resume.content);

  if (isGenerated) {
    return <GeneratedResumePreview resume={resume} />;
  }

  return <PdfResumeContent resume={resume} />;
};

const PdfResumeContent = ({ resume }: Readonly<{ resume: IResume }>) => {
  const { data } = useResumeViewUrl(resume.id);

  if (!data) {
    return (
      <div className="flex aspect-[1/1.414] w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <embed
      className="aspect-[1/1.414] w-full rounded border"
      src={data.url}
      type="application/pdf"
    />
  );
};
