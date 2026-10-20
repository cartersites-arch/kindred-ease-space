// Reviewed, unambiguous short work messages. Do not guess the language of names,
// part numbers, or ambiguous words such as "pie" and "motor".
const pairs = [
  ['stuck', 'atascado'], ['broken', 'roto'], ['loose', 'flojo'],
  ['ready', 'listo'], ['help', 'ayuda'], ['thanks', 'gracias'],
  ['yes', 'sí'], ['no', 'no'], ['stop', 'alto'],
  ['do not use', 'no usar'], ['do not start', 'no arrancar'],
  ['needs repair', 'necesita reparación'], ['done', 'hecho'],
];
const entries = new Map();
for (const [en, es] of pairs) {
  if (en === es) continue;
  entries.set(en, { source: 'en', text: es });
  entries.set(es, { source: 'es', text: en });
}
function split(text) {
  const match = text.match(/^(\s*)(.*?)([.!?]*\s*)$/s);
  return match && { lead: match[1], body: match[2], tail: match[3] };
}
export function shortPhrase(text) {
  const parts = split(text);
  const entry = parts && entries.get(parts.body.toLowerCase());
  if (!entry) return null;
  let value = entry.text;
  if (/^\p{Lu}/u.test(parts.body)) value = value[0].toUpperCase() + value.slice(1);
  if (parts.body === parts.body.toUpperCase()) value = value.toUpperCase();
  return { source: entry.source, translation: parts.lead + value + parts.tail };
}
