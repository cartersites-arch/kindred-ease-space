# English/Spanish fixes — October 20, 2026 UTC

Work is on `test/language-consistency-20261020`. No production deployment made.

## Confirmed live baselines

Cloudflare production deployments observed:

- Teamstead Chat: `b2e6f394-1334-4c3f-ace4-85a038be3d4b`.
- PMS Chat (`project-room`): `9d03c562-9a46-473e-9fba-956b8d274c7c`.
- Teamstead Maintenance: `dc2e6a82-aba7-461a-8924-bb7eb7d644e5`.
- PMS Maintenance: `b87e0a7a-8dd5-48a5-ad94-ffa62a208988`.

Both live Chat JavaScript bundles contain `minLength:10` language detection and
a separate `part.trim().length<10` translation skip. PMS already uses local
browser translation; its recovered server-provider branch is an older assembly.

## Changes in this branch

- Explicit short English/Spanish work phrases, including Atascado/Stuck, translate
  without inference. Capitalization, punctuation, URLs and mentions are retained.
- Chat no longer silently skips short segments of longer messages.
- Chat language state is remounted on company/person changes. Untranslated short
  text can show the original/unavailable status and retry.
- Maintenance handles the same short phrases, invalidates pending output after
  language changes, rejects signed-out requests and empty results, and restarts a
  failed worker on retry.
- The tested PMS glossary/identifier/number/negation protection module is staged
  for Teamstead's worker under versioned v3 filenames. It remains a draft glossary,
  not a guarantee of semantic accuracy or a human bilingual review.
- Language controls and original/retry controls have compact widths and a 44px
  minimum height.

## Rollout constraints

These are source snapshots, not a complete copy of the newest live applications.
Do not deploy an inherited preparation script or the old recovered PMS app over
production. Complete current frontend/backend/asset manifests and cache-version
reconciliation are required. Preserve newer automatic maintenance-request and
company-asset features, backend bindings, permissions, records and personal links.

PMS Chat was opened in the available browser and requires a passkey/private setup
link. No authenticated live test, private-link recovery, physical iPhone/Safari
test or successful production rollout is claimed. No login bypass was attempted.

## Checks

- `node docs/teamstead-chat-translation/translator-check.mjs`: fixture worker
  state tests plus exact short-phrase, whitespace, punctuation and link checks.
- `node docs/teamstead-offline-translation/lifecycle-check.mjs`: short phrases,
  signed-out guard, language cancellation, worker failure/retry, identity switch.
- `preferences-check.mjs` with a rebuilt client bundle: both device defaults and
  independent employee preferences.
- The imported maintenance protection module's existing 22 tests pass separately.

No new real-model browser result is claimed by these automated fixture checks.

`docs/language-fix-20261020/patch-chat-bundle.mjs` also provides a guarded,
frontend-only patch for BOTH actual downloaded live Chat bundles. It verifies
their SHA256 hashes and each exact replacement count, refusing changed builds.
`patch-chat-check.mjs` extracts and executes the actual patched translation
functions with the real language detector: both directions, Atascado, punctuation,
case, whitespace, URLs and mentions pass without inference. Both patched full
bundles also pass JavaScript parsing. This does not establish authenticated UI
or production deployment success. It avoids replacing newer app features, but
still requires the complete deployment asset manifest/backend before publishing.
