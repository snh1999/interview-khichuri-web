import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface IProps {
  content: string;
  style?: "typeset-docs" | "typeset-chat";
}

export function MarkdownContent({ content, style }: Readonly<IProps>) {
  return (
    <div className={`typeset w-full ${style}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
