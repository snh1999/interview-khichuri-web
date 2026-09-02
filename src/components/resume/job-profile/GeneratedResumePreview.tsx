import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import type { IResume } from "@/api/resumes";
import { mergeIntoFormData } from "@/components/resume/job-profile/resume.helpers.ts";
import {
  A4_HEIGHT_PT,
  A4_WIDTH_PT,
  RenderProvider,
} from "@/components/resume/PDFAdapter.tsx";
import {
  useTemplatePdfSettings,
  useTemplateSections,
} from "@/components/resume/template.helpers.ts";
import {
  resolveTemplateEntry,
  resolveTemplateKey,
} from "@/components/resume/template-registry.ts";

interface IProps {
  resume: IResume;
}

const A4_RATIO = A4_HEIGHT_PT / A4_WIDTH_PT;

const useA4PreviewHeight = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(A4_HEIGHT_PT * (4 / 3));

  useEffect(() => {
    if (!container) {
      return;
    }
    const update = () => setHeight(container.clientWidth * A4_RATIO);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [container]);

  return { containerRef: setContainer, height };
};

export const GeneratedResumePreview = ({ resume }: Readonly<IProps>) => {
  const templateId = resolveTemplateKey(resume.template);
  const ResumeComponent = resolveTemplateEntry(templateId).component;
  const sections = useTemplateSections(templateId);
  const effectivePdfSettings = useTemplatePdfSettings(templateId, {});
  const { containerRef, height } = useA4PreviewHeight();

  return (
    <div className="w-full" ref={containerRef}>
      <PDFViewer
        className="w-full"
        showToolbar={false}
        style={{ height: `${height}px` }}
      >
        <RenderProvider mode="pdf" settings={effectivePdfSettings}>
          <ResumeComponent
            data={mergeIntoFormData(resume.content)}
            sections={sections}
          />
        </RenderProvider>
      </PDFViewer>
    </div>
  );
};
