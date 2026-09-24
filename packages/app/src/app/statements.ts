export interface StatementPart { text: string; href?: string; label?: string }
const urlPattern = /https?:\/\/[^\s<>"']+/g;
export function statementParts(body: string): StatementPart[] {
  const parts: StatementPart[] = []; let cursor = 0;
  for (const match of body.matchAll(urlPattern)) {
    const index = match.index!; let url = match[0];
    while (url && '.,;:!?'.includes(url.at(-1)!)) url = url.slice(0, -1);
    if (index > cursor) parts.push({ text: body.slice(cursor, index) });
    const characters = Array.from(url);
    parts.push({ text: url, href: url, label: characters.length > 48 ? characters.slice(0, 47).join('') + '…' : url });
    cursor = index + url.length;
  }
  if (cursor < body.length) parts.push({ text: body.slice(cursor) });
  return parts;
}
export function cappedStatement(body: string) { const points = Array.from(body); return { body: points.slice(0, 2000).join(''), truncated: points.length > 2000 }; }
