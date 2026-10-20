# PMS Chat preferred-language integration — October 20, 2026

Working isolated preview:
https://pms-chat-preferred-language-20261020.cartersites.workers.dev/

This is the current PMS frontend with fictional API records. It has no D1, R2,
Supabase, user-secret or production-service binding. Sending messages is rejected.
Only the fictional reader preference is saved, in an isolated preview cookie.

## Implemented

- Compact English/Español selector in the Chat header, available even on Home.
- The production integration calls the EXISTING authenticated `language` action
  with `automatic:true`, preserving its per-employee authorization and storage.
  After saving, the app reloads using the chosen reading language. Failed saves
  restore the previous selection and show a retryable error.
- Current automatic display, original-text toggle and local model retained.
- Short-phrase gaps fixed through the guarded current-live bundle patch.
- Versioned maintenance terminology/identifier/number/negation protections staged
  for the local worker. Glossary remains a draft; translation is not infallible.
- Failed translations explicitly identify the displayed text as the original.

## Observed browser results

- English: `Atascado` automatically displayed `Stuck`.
- Spanish: `Stuck!` automatically displayed `Atascado!`.
- English-to-Spanish real model: `The motor does not start.` automatically
  displayed `El motor no arranca.` inside the Chat list.
- Spanish-to-English real model: `El motor no arranca.` automatically displayed
  `The engine doesn't start.` inside the Chat list.
- View original/Ver original retained the exact source text in both directions.
- Both selector choices survived the automatic reload. Selecting a language
  currently returns the interface to Home; the chat can then be reopened.
- Existing model download failure fallback was observed: original text remained
  visible with unavailable status and retry. Short phrases continued to work.
- Current app lazy-loaded panels were included in the preview after initial
  missing-asset failures were identified and corrected.

These are desktop cloud-browser tests with synthetic records, not physical
iPhone/Safari tests or authenticated production-company tests. The source-map
hash guard, exact replacement counts, full JavaScript parse, picker state/error
checks and existing 22 terminology-protection checks pass.

## Preview downloads

Direct public model downloads failed in the test browser. This preview serves
only public files from two fixed model repositories, forcing the documented
revision hashes even if the library asks for `main`. Runtime downloads are
restricted to the two fixed ONNX WASM files. Only GET and fixed public filenames
are accepted; no message text is sent through these routes. Inference runs in
the browser worker. The preview's worker source includes its public assets and
can be redeployed without the old Windows build folders.

The preview uses the existing Transformers runtime version. This older runtime
requested a `main` config despite the earlier revision option. The restricted
preview download route maps it to the fixed revision; the older production
documentation's revision claim should not be treated as independently verified
for every earlier asset request.

## Production status

Released to the live PMS Chat workspace on October 20, 2026 as deployment
`01f24943-540f-4026-a1c5-5c689919d98d` in `project-room`. See
`PRODUCTION_RELEASE_20261020.md` for the verified asset identity, preserved
bindings and rollback deployment.

`integrate-pms-reader.mjs` patches only the exact checked current frontend hash.
It does not replace the backend. The production release reused the current
complete deployment bundle and passed cache, byte-identity and live UI checks. Never
deploy an older October 10/11 archive over newer backend features, or connect the
fictional preview API to production records. No production database migration,
permission change, message write, live notification or login bypass was made.
