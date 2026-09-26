import { lazy, Suspense } from "react";
import type { IResume } from "@/api/resumes";
import { useResumeViewUrl } from "@/api/resumes";
import { Spinner } from "@/components/ui/spinner.tsx";

const GeneratedResumePreview = lazy(() =>
  import("@/components/resume/job-profile/GeneratedResumePreview.tsx").then(
    (m) => ({
      default: m.GeneratedResumePreview,
    })
  )
);

interface IViewResumeProps {
  resume: IResume;
}

export const ViewResumeContent = ({ resume }: Readonly<IViewResumeProps>) => {
  if (resume.url) {
    return <PdfResumeContent resume={resume} />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex aspect-[1/1.414] w-full items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <GeneratedResumePreview resume={resume} />
    </Suspense>
  );
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
