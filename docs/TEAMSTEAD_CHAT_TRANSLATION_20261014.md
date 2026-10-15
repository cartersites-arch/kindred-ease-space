# Automatic English/Spanish translation in Teamstead Chat

Released on 2026-10-14 to https://teamsteadcrew.com, Cloudflare Pages project `teamstead-crew` in Teamstead Software. Final production deployment: `3f3c1bee-3640-43d9-923b-e946b0ee7f64`. The prior production deployment `41732655-120e-4ca2-9466-b8ea0b92c29c` remains available for rollback.

## Delivered

Messages, thread parents/replies, pinned messages, saved messages, shared-file captions and search-result bodies use automatic English/Spanish rendering. The browser language selects the default. An optional Language / Idioma control appears in the desktop header and Settings, with the choice stored separately by company/person on that device. Original message text remains the authoritative saved value. Sending, editing, copying, searching and work-order creation continue to use that original, not an automatic translation. Search matches the original stored language; this is not bilingual search indexing.

The first needed translation automatically loads public language files. No separate employee installation, manual download or Translate button is required. The public files are cached on each browser/device. Messages translate when they enter view, so opening a long history does not immediately translate every old message. Original text remains visible while preparing translation, with fallback and retry if translation fails. View original / Ver original is available beside translated messages.

## Privacy and implementation

This reuses the Maintenance Hub's browser-local Transformers.js 4.3.1 engine and pinned English/Spanish model revisions. Message text goes only to a local browser worker, not a translation API. A bounded, deduplicated in-memory translation cache is cleared on account/company changes. Pending results cannot cross that boundary. No translated messages are added to localStorage or a server database. The added persistent preference contains only the chosen language; normal pre-existing application draft storage is unchanged.

The worker permits public GET model/runtime downloads, omits credentials and referrers, and rejects POST requests, query-bearing requests and unknown initial hosts. Links, mentions, inline code and newlines are preserved outside inference. Fenced code and overlong/unsupported input fall back to the original. The engine retains the Hub's identifier, number, negation and test-marker checks and its reviewed safety phrases/glossary.

The existing backend Worker is preserved byte for byte: SHA256 `b81271bea150f237a1e412d20d14a7760c4370eec9ed277c9ef2f81aa93f0e6a`. Production retains D1 `24543c2f-3d1f-4313-b46f-0708b6db28a1` and R2 `teamstead-chat-photos`. No schemas, permissions, billing/subscription mappings, secrets, passkeys or Maintenance Hub backend were changed. The marketing homepage and owner dashboard remain on their existing handlers. CSP permits the local WASM translator and its public downloads; private API access remains authenticated.

## Verification

- TypeScript check and production frontend build passed. The inherited stylesheet emits existing Tailwind directive warnings; the established compiled application stylesheet was retained, with separate translation CSS inheriting surrounding text colors for readability in the existing theme.
- State tests passed for device-language defaults, same-language skip, duplicate requests, bounded memory caching, account cancellation, separate scopes, exact links/mentions/newlines/code, failed inference, long-text fallback and signed-out behavior. These tests mock the worker and are not claimed as real translation tests.
- Worker privacy tests passed: only public GET downloads are allowed, credentials/referrers are omitted, and text-bearing POST/query requests or unknown hosts are rejected.
- A fictional-company hosted preview ran real local-model translation under the production CSP. English→Spanish, Spanish→English, worn belts, negative instructions and exact link/mention preservation passed. Original toggles, thread replies, saved messages and search results were verified. Preview API responses are fictional fixtures; translations are actual model/engine outputs, not simulated translation responses.
- A fresh preview worker translated a cached dummy sentence with network model downloads blocked: `TEST ONLY: El motor no arranca.`, zero network downloads, passed. This checks translator caching, not offline Chat authentication or database use.
- Two clearly labeled dummy messages were submitted through the actual signed-in existing test-company Chat, saved, reopened after reload and displayed in both languages. The English original remained exact through View original and the Edit message form. No edit was submitted, no maintenance certification was performed, and no paid checkout was started. The dummy messages remain labeled test-only in the existing company conversation.
- Live observed output for the English dummy: `TEST ONLY — CHAT-EN-20261014: El motor no arranca. Revisa el cable de alimentación. Esta es una prueba de traducción de ficción. No se requiere trabajo.`
- Live observed output for the Spanish dummy: `SOLO PRUEBA — CHAT-ES-20261014: The door is jammed. Do not operate this equipment. This is a fictitious example for checking translation. No work required.`
- The English preference survived reload. Live browser translation logs had no errors/warnings in the checked session.
- The actual live Settings page was checked at a 390×844 viewport. Document width and scroll width were both 390; its language control selected Spanish successfully. The temporary viewport was reset. No physical-phone test is claimed.
- All five final served assets matched the tested SHA256 values: HTML, app entry, translation CSS, worker and Transformers runtime. Cloudflare confirmed the final production deployment and unchanged database/storage bindings.
- Public homepage/signup returned 200. Anonymous company Chat and work-order API requests returned 401. The actual owner-dashboard API returned 302 to administrator authentication. No new two-company data-isolation enrollment/audit is claimed by this frontend release; existing backend scoping is unchanged.

Creating an additional owner-only test channel required the existing recent-passkey security confirmation. That pending attempt was abandoned by reloading without bypassing the security check; the existing labeled test company's conversation was used instead. No new permissions were granted.

## Limits and source evidence

Translation can be imperfect. View original remains available; reviewed sample meaning is not a guarantee for all terminology. This adds message translation and bilingual translation controls, not a full translation of every Chat navigation caption or bilingual database search. New devices or cleared browser caches must load the public model files again. Chat itself still needs its normal network connection. No paid translation API is used; existing hosting, network and subscription costs are separate.

Source snapshots and state/privacy checks are archived in `teamstead-chat-translation/`. They are evidence for integration with the reviewed Teamstead frontend, not a standalone app or permission to run inherited PMS deployment scripts. Public preview fixtures contain only fictional data. Live screenshots and company identifiers stay in local artifacts, not public assets or this source archive. Carter's test evidence branch is separate from Derek's main and clean PR #10; those are unchanged.
