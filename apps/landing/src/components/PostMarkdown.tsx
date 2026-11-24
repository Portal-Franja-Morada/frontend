import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

type PostMarkdownProps = {
  content: string;
};

const components: Components = {
  h2: ({ children }) => (
    <h2 className="text-[26px] leading-[34px] font-bold text-franja-dark">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-card-title leading-7 font-bold text-franja-dark">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-base leading-[26px] font-normal text-franja-dark">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-normal text-franja-morada transition-opacity hover:opacity-80"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-franja-dark">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-2 ps-5 text-base leading-[26px] text-franja-dark">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 ps-5 text-base leading-[26px] text-franja-dark">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="rounded-xl bg-franja-rose p-6 text-base leading-[26px] text-franja-morada [&_h2]:text-xs [&_h2]:leading-[18px] [&_h2]:text-franja-morada [&_h3]:text-xs [&_h3]:leading-[18px] [&_h3]:text-franja-morada [&_p]:text-base [&_p]:text-franja-morada [&_strong]:text-franja-morada">
      {children}
    </blockquote>
  ),
};

export function PostMarkdown({ content }: PostMarkdownProps) {
  return (
    <div className="[&>*+*]:mt-6">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
