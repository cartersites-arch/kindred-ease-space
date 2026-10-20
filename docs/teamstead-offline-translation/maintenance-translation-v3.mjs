// Deterministic terminology protection for the existing local EN/ES model.
// This is a draft glossary, pending bilingual maintenance review.
export const GLOSSARY_VERSION = 'pms-maintenance-20261019-1';
export const glossary = [
  ['lug nuts', 'tuercas de rueda'], ['lug nut', 'tuerca de rueda'],
  ['wheel studs', 'espárragos de rueda'], ['wheel stud', 'espárrago de rueda'],
  ['gear boxes', 'cajas de cambios'], ['gear box', 'caja de cambios'],
  ['gearboxes', 'cajas de cambios'], ['gearbox', 'caja de cambios'],
  ['hydraulic leak', 'fuga hidráulica'], ['hydraulic hose', 'manguera hidráulica'],
  ['manual jack', 'gato manual'], ['hand jack', 'gato manual'],
  ['worn belts', 'correas desgastadas'], ['drive belt', 'correa de transmisión'],
  ['brake pads', 'pastillas de freno'], ['cotter pin', 'pasador de aleta'],
  ['rear axle', 'eje trasero'], ['front axle', 'eje delantero'],
  ['do not operate', 'no operar'], ['do not start', 'no encender'],
];
export const rideNames = ['Zipper', 'Super Shot', 'Freak Out', 'Rock n Tugs', 'Rocking Tug', 'Tug Boat', 'Backspin', 'Zander', 'Merry Go Round'];
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fold = s => s.normalize('NFC').toLocaleLowerCase();
function entries(source, names) {
  const terms = new Map();
  for (const [en, es] of glossary) {
    const from = source === 'en' ? en : es;
    if (!terms.has(fold(from))) terms.set(fold(from), source === 'en' ? es : en);
    // Protect the noun phrase, including its article, so fragmented NMT cannot
    // introduce a mismatched article ("el tuerca", "el manguera").
    if (!en.startsWith('do not')) {
      const plural = /s$/.test(es), feminine = /^(?:tuerca|caja|fuga|manguera|correa|pastilla)/.test(es);
      const definite = plural ? (feminine ? 'las' : 'los') : (feminine ? 'la' : 'el');
      const indefinite = plural ? (feminine ? 'unas' : 'unos') : (feminine ? 'una' : 'un');
      if (source === 'en') {
        terms.set('the '+en, definite+' '+es);
        if (!plural) terms.set('a '+en, indefinite+' '+es);
      } else {
        terms.set(definite+' '+es, 'the '+en);
        if (!plural) terms.set(indefinite+' '+es, 'a '+en);
      }
    }
  }
  // Names supplied by an authorized caller are literal data, never regex/code.
  for (const name of [...rideNames, ...names]) if (typeof name === 'string' && name.trim() && name.length <= 100) terms.set(fold(name), null);
  return terms;
}
export function protect(text, source, names = []) {
  if (!['en', 'es'].includes(source) || typeof text !== 'string' || text.length > 6000 || text.includes('ZXQKEEP')) throw Error('Invalid translation input');
  const terms = entries(source, names);
  const alternatives = [...terms.keys()].sort((a,b) => b.length-a.length).map(escape).join('|');
  // Numeric expressions, units, URLs and alphanumeric identifiers must survive exactly.
  const pattern = new RegExp(`https?:\/\/[^\\s]+|(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])(?=[A-Za-z0-9_-]*[A-Za-z])(?=[A-Za-z0-9_-]*[0-9])[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*(?![\\p{L}\\p{N}])|\\b[0-9]+(?:[.,/][0-9]+)*(?:\\s*(?:mm|cm|km|ft|in|psi|rpm|lb|lbs|kg|Nm|N·m)\\b)?`, 'giu');
  const protectedTerms = [];
  const masked = text.replace(pattern, original => {
    const translated = terms.get(fold(original));
    const value = translated == null ? original : translated;
    const token = `ZXQKEEP${String(protectedTerms.length).padStart(4,'0')}QXZ`;
    protectedTerms.push({ token, original, value });
    return token;
  });
  return { masked, protectedTerms };
}
export function restore(masked, protectedTerms) {
  let output = masked;
  for (const {token,value} of protectedTerms) {
    if (output.split(token).length !== 2) throw Error('Protected term lost, repeated or changed');
    output = output.replace(token, () => value);
  }
  if (/ZXQKEEP/i.test(output)) throw Error('Unresolved term');
  return output;
}
export function validateMeaning(original, translated, source) {
  if (typeof translated !== 'string' || !translated.trim() || translated.length > 12000) throw Error('Invalid translation');
  const numbers = s => (s.match(/\b[0-9]+(?:[.,/][0-9]+)*\b/g) || []).sort();
  if (JSON.stringify(numbers(original)) !== JSON.stringify(numbers(translated))) throw Error('Numeric values changed');
  const negation = { en: /\b(?:not|never|no|cannot|can't|don't|doesn't|isn't|aren't|won't|without)\b/i, es: /\b(?:no|nunca|ninguna|ningún|sin)\b/i };
  const target = source === 'en' ? 'es' : 'en';
  if (negation[source].test(original) !== negation[target].test(translated)) throw Error('Negation changed');
  const uncertain = {en:/\b(?:might|maybe|possibly|perhaps|seems?|appears?)\b/i,es:/\b(?:podría|quizás|quizá|tal vez|posiblemente|parece|parecen)\b/i};
  if (uncertain[source].test(original) && !uncertain[target].test(translated)) throw Error('Uncertainty lost');
  if (/nuez de ave|nuez de pájaro/i.test(translated)) throw Error('Known incorrect part translation');
  return translated;
}
export async function translateMaintenance(text, source, translate, names = []) {
  // Common short reports are too ambiguous for the general-purpose local
  // model. Translate this narrow, exact pattern deterministically instead.
  if (source === 'es') {
    const report = text.trim().match(/^(?:se\s+)?necesita\s+(?:(?:un|una)\s+)?(.+?)\s+nuev[oa]\.?$/i);
    if (report) {
      const item = glossary.find(([en,es]) => !en.startsWith('do not') && fold(es) === fold(report[1]));
      if (item) return 'Needs a new '+item[0]+'.';
    }
  }
  const {masked, protectedTerms} = protect(text, source, names);
  if (!text.trim()) throw Error('Empty text');
  let output;
  try {
    output = restore(await translate(masked), protectedTerms);
  } catch {
    // Some NMT models rewrite placeholders. Translate only the surrounding
    // language in that case; no unvalidated placeholder ever reaches the UI.
    const tokens = new Map(protectedTerms.map(item => [item.token, item.value]));
    const chunks = masked.split(/(ZXQKEEP[0-9]{4}QXZ)/g);
    const parts = [];
    for (const chunk of chunks) {
      if (tokens.has(chunk)) parts.push(tokens.get(chunk));
      else if (chunk.trim() && /[\p{L}]/u.test(chunk)) {
        const leading = chunk.match(/^\s*/)[0], trailing = chunk.match(/\s*$/)[0];
        const value = await translate(chunk.trim());
        if (typeof value !== 'string' || !value.trim()) throw Error('Empty segment');
        parts.push(leading + value.trim() + trailing);
      } else parts.push(chunk);
    }
    output = parts.join('');
  }
  return validateMeaning(text, output, source);
}

