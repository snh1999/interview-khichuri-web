import type { Components } from "react-markdown";

export const markdownComponents: Components = {
  p(props) {
    const { children } = props;
    return <p className="mb-3 leading-relaxed last:mb-0">{children}</p>;
  },
  ul(props) {
    const { children } = props;
    return <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>;
  },
  ol(props) {
    const { children } = props;
    return <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>;
  },
  a(props) {
    const { children, href } = props;
    return (
      <a
        className="break-all text-blue-600 underline"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  },
  code(props) {
    const { children } = props;
    return (
      <code className="rounded bg-muted px-1 py-0.5 text-xs">{children}</code>
    );
  },
  h1(props) {
    const { children } = props;
    return (
      <h1 className="mt-4 mb-2 font-semibold text-base first:mt-0">
        {children}
      </h1>
    );
  },
  h2(props) {
    const { children } = props;
    return (
      <h2 className="mt-4 mb-2 font-semibold text-sm first:mt-0">{children}</h2>
    );
  },
};
