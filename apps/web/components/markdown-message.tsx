"use client";

import ReactMarkdown from "react-markdown";
import { Children, isValidElement } from "react";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { cn } from "@vanx/ui/lib/utils";
import "highlight.js/styles/github-dark.css";
import type { Element, Parent, Root } from "hast";
import type { Node } from "unist";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

const BLOCK_TAGS = new Set([
  "pre",
  "div",
  "table",
  "ul",
  "ol",
  "li",
  "blockquote",
]);

// rehype plugin to unwrap paragraphs that end up containing block-level
// content (common when LLM responses include raw HTML). Next.js 16/React 19
// now throws for invalid nesting like <p><pre>...</pre></p>, so we hoist the
// paragraph's children into the parent.
const rehypeUnwrapInvalidParagraphs = () => {
  const isParentNode = (node: Node): node is Parent => {
    return "children" in node && Array.isArray((node as Parent).children);
  };

  const isElementNode = (node: Node): node is Element => {
    return node.type === "element";
  };

  const hasBlockDescendant = (node: Node): boolean => {
    if (!isParentNode(node)) {
      return false;
    }
    return node.children.some((child) => {
      if (isElementNode(child)) {
        const tag = child.tagName;
        if (tag && BLOCK_TAGS.has(tag)) return true;
      }
      return hasBlockDescendant(child);
    });
  };

  const visit = (node: Node): void => {
    if (!isParentNode(node)) {
      return;
    }

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      if (isElementNode(child) && child.tagName === "p") {
        if (hasBlockDescendant(child)) {
          // Replace the paragraph node with its children
          node.children.splice(i, 1, ...child.children);
          i -= 1; // Re-evaluate the new child at this position
          continue;
        }
      }
      visit(child);
    }
  };

  return (tree: Root) => {
    visit(tree);
  };
};

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn("max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeHighlight,
          rehypeUnwrapInvalidParagraphs,
        ]}
        components={{
          code({
            inline,
            className: codeClassName,
            children,
            ...props
          }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const language = match ? match[1] : "";
            return !inline ? (
              <div className="bg-[#0d1117] border border-border rounded-lg p-4 overflow-x-auto my-2">
                <pre className="bg-transparent p-0 m-0 border-0">
                  <code
                    className={cn(codeClassName, "text-sm")}
                    data-language={language}
                    {...props}
                  >
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code
                className={cn(
                  "bg-muted px-1.5 py-0.5 rounded text-xs font-mono",
                  codeClassName,
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            // Next.js 16/React 19 enforces valid DOM nesting; some LLM
            // responses can include raw HTML like <pre> inside paragraphs.
            // Detect block-level children and avoid wrapping them in <p>.
            const hasBlock = (node: React.ReactNode): boolean => {
              return Children.toArray(node).some((child) => {
                if (!isValidElement(child)) return false;
                const tag =
                  typeof child.type === "string" ? child.type : undefined;
                if (tag && BLOCK_TAGS.has(tag)) return true;
                const childProps = (child as React.ReactElement).props as {
                  children?: React.ReactNode;
                };
                return hasBlock(childProps?.children);
              });
            };

            const containsBlock = hasBlock(children);

            if (containsBlock) {
              return (
                <div className="mb-3 last:mb-0 text-foreground leading-relaxed space-y-3">
                  {children}
                </div>
              );
            }

            return (
              <p className="mb-3 last:mb-0 text-foreground leading-relaxed">
                {children}
              </p>
            );
          },
          ul({ children }) {
            return (
              <ul className="mb-3 last:mb-0 pl-6 list-disc text-foreground space-y-1">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="mb-3 last:mb-0 pl-6 list-decimal text-foreground space-y-1">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li className="text-foreground">{children}</li>;
          },
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold mb-3 mt-4 text-foreground first:mt-0">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-bold mb-2 mt-4 text-foreground first:mt-0">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-semibold mb-2 mt-3 text-foreground first:mt-0">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-base font-semibold mb-2 mt-3 text-foreground first:mt-0">
                {children}
              </h4>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                {children}
              </a>
            );
          },
          hr() {
            return <hr className="my-4 border-border" />;
          },
          strong({ children }) {
            return (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            );
          },
          em({ children }) {
            return <em className="italic text-foreground">{children}</em>;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-border rounded-lg">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody>{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="border-b border-border">{children}</tr>;
          },
          th({ children }) {
            return (
              <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-border px-4 py-2 text-foreground">
                {children}
              </td>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
