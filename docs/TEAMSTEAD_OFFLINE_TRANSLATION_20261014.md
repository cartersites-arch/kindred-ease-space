# Private English/Spanish Maintenance Hub translation

Released October 14, 2026 to Teamstead Software's commercial Pages project `pms-company-hub`. Final production deployment: `dc2e6a82-aba7-461a-8924-bb7eb7d644e5`. Backend remains `fhqmnlpgqslllzrovxbp`; the original database, company authorization, billing gate, photo permissions and passkeys remain in place. Internal PMS, Kindred runtime and Chat were not deployed or changed by this release.

## Employee experience

The Hub selects English or Spanish from the device/browser language automatically. A Language / Idioma control provides an optional override, saved separately by employee ID on that device. English employees see English notes and Spanish employees see Spanish notes, regardless of the original input language. Originals remain saved unchanged and accessible through View original / Ver original. Names, equipment names and role permissions are not translated into new identities.

The first needed translation downloads public model/runtime files automatically in the browser. There is no separate app, manual file download, translation button or paid translation API key in the employee workflow. Downloads are cached for subsequent use. Clearing browser storage or moving to a new device requires downloading again. The Hub itself still requires its normal network connection for authentication and database operations; this release does not make the entire application offline.

## Implementation and privacy

- Transformers.js 4.3.1 runs quantized Marian/OPUS translation in a browser worker, with one active model direction at a time.
- Model revisions are pinned: English→Spanish `Xenova/opus-mt-en-es` revision `4b002a4c7edd54a7ced58877258b87f7efd3f892`; Spanish→English `Xenova/opus-mt-es-en` revision `eadfd7c658a9d8929ac3b8e996b68a68e2c7d480`.
- The original [English→Spanish](https://huggingface.co/Helsinki-NLP/opus-mt-en-es) and [Spanish→English](https://huggingface.co/Helsinki-NLP/opus-mt-es-en) models identify an Apache-2.0 license. The distributed runtime retains its license notices.
- Private note text goes to the local worker, not a translation API. Its network wrapper permits only GET downloads from the configured public model/runtime hosts and same origin, omits credentials and referrers, and rejects other methods and query-bearing requests. Download diagnostics contain only host/method/public-file metadata.
- Browser persistence added by this feature contains language preferences and public model/runtime files, not translated company notes. Account changes cancel pending workers/results. Language changes reject stale results for the previous target language.
- Source detection is limited to English and Spanish. Empty/unsupported/failed translations show the original. Reviewed common safety phrases and a small mechanical glossary supplement the real model. IDs, dates, numbers, embedded TEST ONLY markers and tested negations are checked before accepting output.
- Saved descriptions, missing-photo reasons, instructions, completion notes, denial reasons and event details use the preferred-language renderer. Duplicate event detail copies are suppressed. The prepared build changes 247 language-label bindings and retains the existing application behavior and backend target.

No Gemini secret is required by this path. No key was created, copied or exposed, and no credits, subscription or hosting upgrade was purchased. Existing hosting and application billing are separate from translation; no paid translation API call is made.

## Verified results

1. Six actual local-model English/Spanish maintenance examples passed on the hosted preview under the Hub's CSP. A seventh embedded TEST ONLY marker case also passed. Full dummy-input outcomes are in `teamstead-offline-translation/real-translation-results.json`. Responses were produced by the local model plus documented reviewed phrases, not simulated server responses.
2. A fresh worker translated an already-cached example with network downloads blocked: correct Spanish output, zero network downloads. This tests the translation cache, not offline database use.
3. Automated preference tests passed for en-US and es-MX device defaults and separate employee IDs. Browser checks verified employee preference separation and restoration.
4. Isolated Hub UI checks used fictional records and the real translator, including a completed record with saved instructions and completion notes. A 390×844 viewport checked the Spanish mobile layout; physical phones were not used.
5. Live TS-2 was reopened in the authorized workspace. Its English description, missing-photo reason, instructions, completion notes and review history displayed Spanish automatically. Embedded markers remained intact. View original retained the exact English text, the completion image loaded at 640×480, and TS-2 remained Completed. No signature, physical inspection or work certification was repeated.
6. A clearly labeled Spanish dummy request, TS-3, was submitted through the live Spanish form on existing test equipment. Its original Spanish and honest missing-photo explanation saved. After choosing English and reloading, both displayed English automatically; View original retained the exact Spanish. The dummy request was then denied with an explicit test-finished/no-real-defect explanation to remove it from the active queue. Its record was retained, not deleted or physically certified.
7. Actual backend privacy regression passed: anonymous read 401, invalid company access 401, anonymous write 401, untrusted origin 403. No private records were returned. This release did not change company-scoping SQL or RLS; no claim is made that two new real companies were enrolled for a new cross-company audit.

Private local screenshots and live-record identifiers remain in the test artifact, outside public site assets and repository evidence. Public diagnostics contain only fictional examples and were deployed to the preview branch, not production.

## Limits and source archive

Automatic translations can be imperfect; the original text remains the authoritative saved record. The test checks preserved meaning for its dummy examples, IDs and negative instructions, not every possible maintenance term. Some legacy decorative/helper captions remain bilingual. Chat translation is not part of this deployment.

Source/config/test snapshots are in `teamstead-offline-translation/`. The preparation script uses a reviewed commercial baseline and existing local presentation resources; it is an evidence snapshot, not an instruction to deploy an inherited PMS script. Rollback remains available to the prior Pages production deployments. No live data needs rollback for this display-only feature and its labeled dummy request.
