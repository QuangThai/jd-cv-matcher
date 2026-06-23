import { cn } from "@/lib/utils/cn";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export function ChatMessage({ role, content }: Props) {
  return (
    <div
      className={cn(
        "flex w-full gap-3",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
          role === "user"
            ? "bg-signal-blue text-paper"
            : "border border-chalk bg-mist text-ink"
        )}
      >
        {role === "assistant" ? (
          <MarkdownContent content={content} />
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
}

/** Simple markdown renderer for chat messages */
function MarkdownContent({ content }: { content: string }) {
  // Split by markdown patterns and render appropriately
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-2 overflow-x-auto rounded-lg bg-muted/80 p-3 text-xs font-mono"
          >
            <code>{codeBlockContent.join("\n")}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Bold text
    const renderInline = (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    // Headings
    if (line.startsWith("### ")) {
      if (inList) { elements.push(<br key={`br-${i}-a`} />); inList = false; }
      elements.push(
        <h3 key={`h3-${i}`} className="mt-3 mb-1 text-sm font-semibold">
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) { elements.push(<br key={`br-${i}-b`} />); inList = false; }
      elements.push(
        <h2 key={`h2-${i}`} className="mt-4 mb-1 text-base font-bold">
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      if (inList) { elements.push(<br key={`br-${i}-c`} />); inList = false; }
      elements.push(
        <h1 key={`h1-${i}`} className="mt-4 mb-2 text-lg font-bold">
          {renderInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Unordered list — use a simpler approach: track items and batch-render
    if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      elements.push(
        <div key={`li-${i}`} className="flex gap-2 ml-4">
          <span className="text-muted-foreground shrink-0">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      inList = true;
      const text = line.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={`ol-${i}`} className="flex gap-2 ml-4">
          <span className="text-muted-foreground shrink-0">{line.match(/^\d+/)?.[0]}.</span>
          <span>{renderInline(text)}</span>
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (line === "---" || line === "___") {
      if (inList) { elements.push(<br key={`br-${i}-d`} />); inList = false; }
      elements.push(<hr key={`hr-${i}`} className="my-3 border-border/50" />);
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      if (inList) { inList = false; }
      elements.push(<br key={`br-${i}-e`} />);
      continue;
    }

    // Regular paragraph
    if (inList) { inList = false; }
    elements.push(
      <p key={`p-${i}`} className="my-1">
        {renderInline(line)}
      </p>
    );
  }

  // Close open code block
  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(
      <pre key="code-open" className="my-2 overflow-x-auto rounded-lg bg-muted/80 p-3 text-xs font-mono">
        <code>{codeBlockContent.join("\n")}</code>
      </pre>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
}
