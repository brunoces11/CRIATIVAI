import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MarkdownText.css";

export function MarkdownText({ text }: { text: string }) {
  return (
    <div className="markdown-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ href, children, node: _node, ...props }) => (
            <a href={href} target={isExternalHref(href) ? "_blank" : undefined} rel={isExternalHref(href) ? "noreferrer noopener" : undefined} {...props}>
              {children}
            </a>
          ),
          img: ({ alt, node: _node, ...props }) => <img alt={alt ?? ""} loading="lazy" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function isExternalHref(href: string | undefined) {
  return Boolean(href && /^https?:\/\//i.test(href));
}
