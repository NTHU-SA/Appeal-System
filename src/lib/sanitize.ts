const allowedTags = new Set([
  "p",
  "br",
  "strong",
  "b",
  "blockquote",
  "a",
  "span",
  "ul",
  "ol",
  "li",
]);

export function sanitizeReplyHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/ on\w+="[^"]*"/gi, "")
    .replace(/ on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<\/?([a-z0-9-]+)(\s[^>]*)?>/gi, (match, tag) => {
      const lower = String(tag).toLowerCase();
      return allowedTags.has(lower) ? match : "";
    });
}
