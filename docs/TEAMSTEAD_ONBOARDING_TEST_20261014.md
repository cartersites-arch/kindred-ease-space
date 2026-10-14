# Automatic company onboarding fix — October 14, 2026

**Fixed and verified in the isolated environment. Live rollout has not been performed.** Twenty completely new companies signed up, enrolled passkeys, signed in again, automatically received their own Hub schemas, activated both products and saved their own equipment. No company schema was prepared by hand in this run.

## Fix

The authenticated setup handler now queues schema creation and waits briefly for it to finish. A postgres-owned, five-second database job performs the required DDL with the existing reviewed schema-builder template. The provisioning function is `SECURITY INVOKER`, is in a non-exposed schema, and is executable only by its administrator owner. The app runtime remains unable to create schemas or public objects, execute the worker or execute the schema builder. It can only insert the queue's company/owner columns and read queue status; it cannot forge status or modify jobs. Company names, IDs and owner identity are validated, and the signed Chat-owner attestation remains mandatory before any queue request.

Queue uniqueness, row locks, per-company advisory locks and bounded retry state prevent duplicate work. A long wait returns a clear retry message and preserves the already-created account. The earlier overview fix is in the schema-builder template, so new jobs remain visible even when a new company's feature-settings table has no row.

## Real cloud results

- 20 fresh combined companies completed automatic signup and activation. Every provisioning job finished on its first attempt; no provisioning errors were recorded.
- Real deployed handlers verified each owner's ES256 enrollment and a fresh login, using software authenticators. Physical browser passkey prompts were not tested.
- Concurrent repeat activation succeeded. Unauthenticated setup returned 401, cross-company provisioning returned 403, forged-viewer setup returned 401, and invalid company IDs returned 400. Queue rows remained limited to the 20 authorized companies.
- The post-fix 20-company workload made 1,825 measured HTTP requests with no unexpected errors: 400 Chat message writes, 400 reads, and 60 completed maintenance jobs in total (one smoke completion plus 59 in the full run). Each company has three completed jobs confirmed by the database.
- All 20 saved Chat photos opened and decoded correctly. Foreign-company and signed-out photo requests were blocked. Cross-company message, maintenance history, edit and photo requests were blocked.
- Company 21 was rejected at the configured 20-company capacity. Test public signup was then closed.
- Chat API 95th-percentile time: 1.13 seconds. Hub overview: 2.47 seconds. Completion: 3.51 seconds. Workload duration: about 3 minutes 46 seconds, one active owner per company. This is not a maximum employee-count or long-duration benchmark.

The existing 20-company test data was retained in the original test D1. The rerun used fresh D1 `0023bd6f-95ad-4c96-a643-f498a41d32c4`, bound only to `teamstead-capacity-chat`, deployment `f07c51b8`. Supabase remains the dedicated test project `dkcfampfxyydioksrtrl`; Hub test Pages remains `f58a4f5c`. Setup Edge Function is version 2, digest `06bccfe991656d37c519072601bd778c22bcb69ed94071f76a9c5d5165b772c8`.

The test signup-IP counters were reset between batches because the harness runs multiple companies from development-network egress addresses. A separate rate-limit probe used a different address and created a reservation instead of being blocked; that unused reservation was removed only after verifying `building`, cursor zero and no account tables. No existing account, passkey or company content was deleted. IP-rate-limit behavior is not certified by this run; the application's rate-limit code was unchanged.

The security advisor reports informational private-table/no-policy notices only. No new `SECURITY DEFINER` function or broad DDL grant was introduced. One active owner per company, noncritical maintenance, ordinary approval and actual test JPEGs were exercised. No electronic signatures were manufactured. Calls, push, email/Slack, AI, manuals, safety-critical workflows, 100-employee load and payment checkout were excluded.

## Live rollout prepared for review

`production-review/` contains the existing live setup Edge Function before/after files, the corrected schema-builder template, queue migration pinned to live project `fhqmnlpgqslllzrovxbp`, and the queue-aware setup function. Proposed rollout: apply those database changes together, deploy the narrow pending/retry dispatcher change to the existing live `company-setup` function, verify it, and enable the existing Teamstead Crew signup setting at capacity 20. Existing companies, credentials, storage and billing configuration would be retained. The live site uses live Stripe billing; this test did not purchase or validate a paid subscription, and rollout would leave existing billing rules unchanged.

Before rollout, provider checks confirmed live Crew deployment `e9942fde-e6d7-49b1-b052-22686a0ae03a`, live D1 `24543c2f-3d1f-4313-b46f-0708b6db28a1`, no provisioning schema in live Supabase, signup closed, capacity 20 and zero customer companies. Live application changes require explicit approval because the user previously prohibited modifications to Teamstead Sales Hub.

## Saved source and evidence

`onboarding-queue.sql`, `onboarding-company-setup.sql`, `edge/company-setup/index.ts` and `hub-company-functions-fixed.sql` preserve the test fix. `onboarding-security-results.json`, `onboarding-smoke-results.json`, `onboarding-workload-results.json` and `onboarding-photo-results.json` preserve the results. Private dummy credentials remain outside reports and Git in a protected ignored folder. Both the test project and its provisioning job remain running at the previously approved compute rate.
