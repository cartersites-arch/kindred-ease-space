# Teamstead 20-company cloud test — October 14, 2026

**The measured workload passed on the isolated cloud setup, with 20 provisioned companies and one simultaneously active owner per company. New-company onboarding is not ready for release.** One overview defect was fixed in the test project; automatic Hub schema provisioning remains blocked by its runtime role's permissions. No live deployment or database was modified.

| Check | Actual result |
|---|---|
| Registered combined Chat + Hub companies | 20, all activated and opened |
| Credential enrollment and fresh sign-in | 20 real ES256 passkey verifications using software authenticators against deployed HTTPS handlers |
| Concurrent company lanes | 20, one owner per company |
| Chat message writes / reads | 400 / 400 passed |
| Chat photos | 20 uploaded; all decoded as 128×96 JPEGs through authenticated photo links |
| Maintenance work | 3 completed jobs/company; 60 completions confirmed in the database |
| Maintenance photos | Problem and completion photos uploaded and opened for every completed job |
| Cross-company Chat read/edit | All 20 attempts of each type denied with HTTP 401 |
| Cross-company Hub history/edit/photo | All 20 attempts of each type denied with HTTP 404 |
| Chat photo isolation | 20 foreign-photo requests denied with HTTP 404; 20 signed-out requests denied with HTTP 401 |
| Company 21 | Actual signup rejected with HTTP 429 at the configured capacity |
| Measured full workload | 1,825 HTTP requests, no unexpected errors, about 3 minutes 47 seconds |
| Final state | Both test and live public signup closed; live still has zero customer companies and capacity 20 |

One completed smoke-test job preceded the full workload; the full run completed the remaining 59. Database verification shows all 20 companies have at least three completed jobs, exactly 60 completion records, and 121 ready Hub photos. The extra problem photo belongs to the earlier diagnostic job that exposed the overview defect. That incomplete diagnostic job is retained as evidence and excluded from the 60 completed jobs.

## Observed response times

| Request group | Median | 95th percentile |
|---|---:|---:|
| Chat API, including expected isolation denials | 0.81 seconds | 1.10 seconds |
| Hub overview | 1.43 seconds | 2.29 seconds |
| Create maintenance job | 1.65 seconds | 2.05 seconds |
| Upload problem photo | 2.39 seconds | 2.96 seconds |
| Complete maintenance job | 1.29 seconds | 2.55 seconds |

These are client-observed timings for this short test on a separate Supabase Micro database and Cloudflare test projects. They are not a maximum-throughput benchmark or a production performance guarantee. Larger teams, a longer soak test, calls, push notifications, AI, manuals, safety-critical workflows, physical browser passkey ceremonies and manager Slack verification remain untested. No billing or notification side effects were enabled.

## Issues found

1. **Automatic Hub provisioning fails.** The real `finish_signup` request returned HTTP 403 with `permission denied for database postgres`. `company_ensure_schema` tries to create schemas while executing as the runtime service role. Read-only checks confirmed that role lacks database/schema CREATE privileges in both the test and existing live backend. To continue the capacity test, schemas for the 20 dummy companies were prepared through the test administrator connection, then the actual application activation flow completed. No role privileges were expanded and no authentication checks were bypassed. A reviewed provisioning design is still required before automatic customer onboarding can be advertised as working.
2. **Jobs disappeared from a new company's overview.** The original snapshot used a CROSS JOIN against a feature-settings row that did not exist in new company schemas. Saved and published jobs were therefore filtered out. The test fix makes that CTE return one row with default `false` settings when no feature row exists. It was installed on all 20 test snapshot functions and in the future schema-builder template. The subsequent jobs saved, opened and completed while all 20 feature-settings tables remained empty. `fixed-hub-snapshot-template.sql` and `hub-company-functions-fixed.sql` preserve the fix. It has **not** been installed on the live Hub.

The user previously excluded mutation of Teamstead Sales Hub. The live backend is that project, so applying either live onboarding change requires explicit authorization and a concrete reviewed implementation.

## Resource boundaries and security

Test Supabase project: `dkcfampfxyydioksrtrl`, **Teamstead 20 Company Capacity Test**, Teamstead Software organization, US East, healthy. User created it and approved displayed Micro compute pricing of $0.01344/hour, approximately $10/month, plus usage. The project remains running; actual billed usage was unavailable in this test.

Test Chat: https://teamstead-capacity-chat.pages.dev — Pages deployment `fc26bd80-4a02-4501-a435-54052bb86bba`, dedicated D1 `b3e6d756-ca9c-4598-b15f-65aee22a6e2f`, dedicated R2 `teamstead-capacity-photos-20261014`.

Test Hub: https://teamstead-capacity-hub.pages.dev — Pages deployment `429e44a3-78e3-4caa-979b-6b2e9d2885d7`. `company-setup` and `company-hub` Edge Functions use only the new project's built-in runtime service role. Fresh bridge signing keys were generated inside the test backend and kept there. The Chat encryption secret was separately generated and installed as a runtime secret. Outbound backend requests are restricted to the new test project and test Chat hostname; no live credentials were copied. Dummy fixture credentials are in a protected, ignored local folder and excluded from reports, logs and assets.

All 580 public tenant tables have RLS enabled and zero grants to `anon`, `authenticated` or `PUBLIC`. The final security advisor has only informational `rls_enabled_no_policy` notices: intentionally private tables are accessed through authenticated, company-scoped server handlers. Vendor-created `rls_auto_enable()` execute grants were revoked from browser roles in the test project. Performance advisor reports informational missing foreign-key indexes and unused indexes; optimization and broader load testing remain future work. Documentation: [private-table RLS notices](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [foreign-key indexes](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys).

Provider verification confirmed the live Crew deployment remains `e9942fde-e6d7-49b1-b052-22686a0ae03a`, the live Hub Pages deployment remains `d6356db3-7c51-4372-a970-de3ebd9ca069`, and the live Hub schema-builder still has its original snapshot template. Live signup is closed, capacity 20, zero customer companies. Kindred Ease's isolated database, the original PMS projects, Derek's checkout and Git main were not modified.

## Evidence

`chat-twenty-results.json` preserves the earlier local 2,047-assertion check. `cloud-smoke-results.json`, `cloud-workload-results.json` and `photo-isolation-results.json` contain the real HTTPS test results and timings. Source scripts use the unchanged baseline Chat Worker with only test host/database/public-key substitutions, plus the reviewed backend copies and the narrow snapshot default fix. No simulated generation or workflow responses were used for the cloud results. The administrator preparation and signup-quota resets are explicitly recorded as test-fixture setup, not successful automatic onboarding evidence.
