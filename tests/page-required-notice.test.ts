/**
 * Owner-required notices are literal page text, independent of AI compliance.
 * Run: bun tests/page-required-notice.test.ts
 * Offline: exercises normalization and the real Markdown parser only.
 */
import { marked } from "marked";
import {
  REQUIRED_NOTICE_MAX_CHARS,
  normalizeRequiredNotice,
  withRequiredNotice,
} from "../src/lib/page-required-notice";

let pass = 0,
  fail = 0;
const failed: string[] = [];
function t(name: string, condition: boolean, detail = "") {
  if (condition) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failed.push(name);
    console.log(`  FAIL  ${name}  ${detail}`);
  }
}

// Decode one HTML-entity layer, as a browser does for rendered text. A notice
// containing an entity literally must not be decoded twice into owner markup.
function textOfParagraph(html: string): string {
  return html
    .replace(/^<p>|<\/p>$/g, "")
    .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|#39);/gi, (entity, name: string) => {
      if (/^#x/i.test(name)) return String.fromCodePoint(parseInt(name.slice(2), 16));
      if (name.startsWith("#")) return String.fromCodePoint(Number(name.slice(1)));
      return (
        ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" } as Record<string, string>)[
          name.toLowerCase()
        ] ?? entity
      );
    });
}

console.log("\nrequired notices are bounded owner text");
t("the public limit is 500 characters", REQUIRED_NOTICE_MAX_CHARS === 500);
for (const raw of [undefined, null, "", " \t\r\n ", "\u0000\u200b\ufeff"]) {
  t(
    `empty or invisible input becomes no notice (${JSON.stringify(raw)})`,
    normalizeRequiredNotice(raw) === "",
  );
}
t(
  "ordinary whitespace is normalized into one readable paragraph",
  normalizeRequiredNotice(" \tThis is\r\n an isolated\n\n test.  ") === "This is an isolated test.",
);
t(
  "hidden control and direction characters cannot conceal notice text",
  normalizeRequiredNotice("A fi\u0000\u0007\u200bctional \u202ecity\u2066\u2069\ufeff") ===
    "A fictional city",
);
t(
  "a notice at the limit is preserved without truncation",
  normalizeRequiredNotice("x".repeat(REQUIRED_NOTICE_MAX_CHARS)) ===
    "x".repeat(REQUIRED_NOTICE_MAX_CHARS),
);
let tooLong: unknown;
try {
  normalizeRequiredNotice("x".repeat(REQUIRED_NOTICE_MAX_CHARS + 1));
} catch (error) {
  tooLong = error;
}
t(
  "an overlong notice throws a useful error instead of silently truncating",
  tooLong instanceof Error && /500/.test(tooLong.message),
);

console.log("\nnotices render as literal prose, never owner-supplied markup");
const body = "## Listing details\n\nThe supplied record has a daily USD price.";
const literals = [
  "# This must not become a heading",
  "[Book now](https://example.invalid) ![image](https://example.invalid/p.png)",
  '<script>alert("x")</script> <img src=x onerror=alert(1)>',
  "**Not bold** _not italic_ ~~not crossed~~ `not code`",
  "> Not a quote; - not a list; \\ keep this backslash",
  '&lt;img src=x&gt; &#60;script&#62; & " quoted text',
  "https://example.invalid www.example.invalid <https://example.invalid> contact@example.invalid",
  "First line\n\n## Still part of the same plain notice",
];
for (const raw of literals) {
  const notice = normalizeRequiredNotice(raw);
  const composed = withRequiredNotice(body, notice);
  const html = marked.parse(composed, { async: false });
  const end = html.indexOf("</p>");
  const paragraph = html.slice(0, end + 4);
  t(`notice is the first paragraph: ${raw.slice(0, 30)}`, html.startsWith("<p>") && end >= 0);
  t(
    `notice has no executable or formatting elements: ${raw.slice(0, 30)}`,
    !/<\/?(?!p(?:\s|>))[a-z][^>]*>/i.test(paragraph),
    paragraph,
  );
  t(
    `rendered notice retains its literal text: ${raw.slice(0, 30)}`,
    textOfParagraph(paragraph) === notice,
    paragraph,
  );
  t(`model body is preserved after the notice: ${raw.slice(0, 30)}`, composed.endsWith(body));
  t(
    `an identical leading notice is not duplicated: ${raw.slice(0, 30)}`,
    withRequiredNotice(composed, notice) === composed,
  );
}
t("no notice leaves the model body unchanged", withRequiredNotice(body, "") === body);
const warning = "This is an isolated test with a fictional city and dummy listings";
const partial = "## Context\n\nThis is an isolated test.\n\n" + body;
t(
  "a partial model warning cannot replace the complete required notice",
  withRequiredNotice(partial, warning).startsWith(`${warning}\n\n`) &&
    withRequiredNotice(partial, warning).endsWith(partial),
);
const buried = `${body}\n\n${warning}`;
t(
  "a notice later in the model body does not hide the leading notice",
  withRequiredNotice(buried, warning).startsWith(`${warning}\n\n`),
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log("Failed:\n  " + failed.join("\n  "));
  process.exit(1);
}
