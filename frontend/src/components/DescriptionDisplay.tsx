interface DescriptionDisplayProps {
  description?: string;
}

export function DescriptionDisplay({ description }: DescriptionDisplayProps) {
  if (!description) return null;

  // Parse markdown and render as elements
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-sm font-semibold mt-2 mb-1 text-slate-900">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-base font-bold mt-2 mb-1 text-slate-900">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-lg font-bold mt-2 mb-1 text-slate-900">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={idx} className="text-slate-700 ml-4">
            {renderInlineMarkdown(line.substring(2))}
          </li>
        );
      } else if (line.trim()) {
        elements.push(
          <p key={idx} className="text-slate-700 mb-2">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    });

    return elements.length > 0 ? elements : <p className="text-slate-400 text-sm">No description</p>;
  };

  // Render inline markdown (bold, italic, code)
  const renderInlineMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    // Bold
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const boldMatches: { start: number; end: number; text: string }[] = [];
    let match: RegExpExecArray | null;
    while ((match = boldRegex.exec(text)) !== null) {
      boldMatches.push({ start: match.index, end: boldRegex.lastIndex, text: match[1] });
    }

    // Italic
    const italicRegex = /\*([^*]+)\*/g;
    const italicMatches: { start: number; end: number; text: string }[] = [];
    let italicMatch: RegExpExecArray | null;
    while ((italicMatch = italicRegex.exec(text)) !== null) {
      if (!boldMatches.some(b => b.start < italicMatch!.index && italicMatch!.index < b.end)) {
        italicMatches.push({ start: italicMatch!.index, end: italicRegex.lastIndex, text: italicMatch![1] });
      }
    }

    // Code
    const codeRegex = /`([^`]+)`/g;
    const codeMatches: { start: number; end: number; text: string }[] = [];
    let codeMatch: RegExpExecArray | null;
    while ((codeMatch = codeRegex.exec(text)) !== null) {
      codeMatches.push({ start: codeMatch.index, end: codeRegex.lastIndex, text: codeMatch[1] });
    }

    const allMatches = [...boldMatches, ...italicMatches, ...codeMatches].sort(
      (a, b) => a.start - b.start
    );

    allMatches.forEach((m, idx) => {
      parts.push(text.substring(lastIndex, m.start));

      if (boldMatches.includes(m)) {
        parts.push(
          <strong key={`bold-${idx}`} className="font-semibold text-slate-900">
            {m.text}
          </strong>
        );
      } else if (italicMatches.includes(m)) {
        parts.push(
          <em key={`italic-${idx}`} className="italic text-slate-800">
            {m.text}
          </em>
        );
      } else if (codeMatches.includes(m)) {
        parts.push(
          <code key={`code-${idx}`} className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-xs">
            {m.text}
          </code>
        );
      }
      lastIndex = m.end;
    });

    parts.push(text.substring(lastIndex));
    return parts;
  };

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200">
      <div className="text-sm text-slate-700 leading-relaxed">
        {renderMarkdown(description)}
      </div>
    </div>
  );
}
