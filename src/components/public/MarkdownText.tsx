import ReactMarkdown from "react-markdown";

export function MarkdownText({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div className={`prose prose-stone max-w-none prose-headings:font-serif prose-a:text-moss ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
