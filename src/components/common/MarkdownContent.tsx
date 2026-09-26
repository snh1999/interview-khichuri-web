import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/common/markdown/CodeBlock.tsx";

interface IProps {
  content: string;
  style?: "typeset-docs" | "typeset-chat";
}

export function MarkdownContent({ content, style }: Readonly<IProps>) {
  return (
    <div className={`typeset w-full ${style}`}>
      <ReactMarkdown
        components={{ code: CodeBlock }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
