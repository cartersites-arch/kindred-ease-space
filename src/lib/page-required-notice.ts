/** Owner-authored public wording, kept outside the model's editorial choices. */
export const REQUIRED_NOTICE_MAX_CHARS = 500;

export function normalizeRequiredNotice(raw?: string | null): string {
  if (raw == null) return "";
  if (typeof raw !== "string") throw new Error("Required notice must be text.");
  // A notice is one visible paragraph. Remove invisible direction/control
  // characters without silently cutting off an owner's warning.
  const notice = raw
    .replace(/\s+/gu, " ")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, "")
    .trim();
  if (notice.length > REQUIRED_NOTICE_MAX_CHARS) {
    throw new Error(`Required notice must be ${REQUIRED_NOTICE_MAX_CHARS} characters or fewer.`);
  }
  return notice;
}

/** Insert literal public text, never HTML, Markdown instructions or a link. */
export function withRequiredNotice(body: string, rawNotice?: string | null): string {
  const content = body.trim();
  const notice = normalizeRequiredNotice(rawNotice);
  if (!notice) return content;
  // CommonMark permits escaping every ASCII punctuation character. Escaping
  // ampersands and URL punctuation also keeps entities/autolinks literal.
  const paragraph = notice.replace(/[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]/g, "\\$&");
  if (content === paragraph || content.startsWith(`${paragraph}\n\n`)) return content;
  return content ? `${paragraph}\n\n${content}` : paragraph;
}
