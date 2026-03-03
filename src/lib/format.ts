export function fmtNum(n: number | null | undefined): string {
  if (n == null) return "\u2014";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function syntaxHighlightJSON(str: string): string {
  try {
    const obj = typeof str === "string" ? JSON.parse(str) : str;
    const formatted = JSON.stringify(obj, null, 2);
    return formatted.replace(
      /("(?:\\.|[^"\\])*")(\s*:)?|(\b(?:true|false)\b)|(\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      (match, strVal?: string, colon?: string, boolVal?: string, nullVal?: string, numVal?: string) => {
        if (strVal && colon)
          return `<span class="json-key">${escapeHtml(strVal)}</span>${colon}`;
        if (strVal)
          return `<span class="json-string">${escapeHtml(strVal)}</span>`;
        if (boolVal)
          return `<span class="json-bool">${escapeHtml(boolVal)}</span>`;
        if (nullVal)
          return `<span class="json-null">${escapeHtml(nullVal)}</span>`;
        if (numVal)
          return `<span class="json-number">${escapeHtml(numVal)}</span>`;
        return escapeHtml(match);
      },
    );
  } catch {
    return escapeHtml(String(str));
  }
}

export function renderInlineMarkdown(text: string): string {
  if (!text) return "";
  let h = escapeHtml(text);
  h = h.replace(/```[\s\S]*?```/g, (m) => {
    const inner = m.slice(3, -3).replace(/^\w*\n/, "");
    return `<span class="md-codeblock">${inner}</span>`;
  });
  h = h.replace(/`([^`]+)`/g, '<span class="md-code">$1</span>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<span class="md-bold">$1</span>');
  h = h.replace(/&lt;\/?[\w][\w\s_-]*?&gt;/g, '<span class="md-tag">$&</span>');
  return h;
}

export function truncateId(id: string, len = 12): string {
  return id.length > len ? id.slice(0, len) : id;
}

export function cwdShort(cwd: string): string {
  const parts = cwd.split("/").filter(Boolean);
  return parts.length <= 2 ? cwd : parts.slice(-2).join("/");
}
