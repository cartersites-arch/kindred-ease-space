# Kindred Ease Cloudflare test configuration

This branch prepares `cartersites-arch/kindred-ease-space` for an isolated test app in Teamstead Software.

| Setting | Value |
| --- | --- |
| Branch | `test/cloudflare-kindred-ease-20261013` |
| Worker | `kindred-ease-space-test` |
| Account | Teamstead Software (`0e91333c6994f692c3cb0e2d0e0efa02`) |
| Worker URL after deployment | `https://kindred-ease-space-test.pms-chat.workers.dev` |
| Supabase project | `jwqldxatoyeobnoibdvl` |
| Supabase API | `https://jwqldxatoyeobnoibdvl.supabase.co` |
| Custom routes | Empty |

The test app is deployed and its public URL responds. See the verification update below for current evidence; the earlier setup sections retain their historical context.

## October 13 end-to-end verification update

The separate local checkout `isolated-test` has the Carter remote and branch shown above. The suggested parent checkout points to Derek's repository on `test/ai-page-generation` and has unrelated uncommitted edits; do not use it for this test.

The running Worker version was `6783df36-bae7-483f-965a-65a1fab6efb4`, serving 100% of traffic. Its runtime bindings include `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY`; secret values were not read. Runtime `SUPABASE_URL` and the deployed public browser bundle both target `jwqldxatoyeobnoibdvl`. The public version endpoint returned `sha: dev`, so it does not establish the deployed source commit. Local builds must set `BUILD_SHA` when deploying this branch manually.

The isolated Auth accounts are `cartersites@yahoo.com` and `jarhead4zoe@gmail.com`; both have confirmed email addresses. Their separate workspace IDs are `0d787190-6320-49f5-b04e-25bd548cb03b` and `d588a61c-a6cc-45f0-89ca-0135ab6bc9ad`. Each has an active trial ending October 27 and a 25-page base limit. The default AI allowance is 20 generations per workspace and is allocated on first use. Generation is enabled, with a 50-page daily cap.

The actual builder templates are Resource Article (`resource_article`), Category Page (`category_page`, the inventory flow), and City Hub (`city_hub`). Standard uses `gpt-5-nano`, the Responses API, minimal reasoning, `store: false`, 6,000 maximum output tokens and a 120-second timeout. Premium (`gpt-5-mini`) was not selected.

There was no inventory. `scripts/kindred-isolated-e2e-fixtures.sql` added nine explicitly fictional listings per workspace: three listings for each of three categories/cities, priced at $10–$30 USD per day. It is idempotent and must run only on this isolated project. No Sharetribe integration or real inventory sync was fabricated.

Hosted database checks using the `authenticated` role and each account's identity showed nine own listings, zero foreign listings, one visible workspace, one own membership, zero foreign memberships, and zero foreign listing updates. The attempted updates were rolled back. These are database isolation checks, not evidence for authenticated HTTP requests or generated-page direct links.

The first real Yahoo Resource Article request failed before content generation. OpenAI returned HTTP 429, type `insufficient_quota`, code `credit_balance_exhausted`, request ID `req_76e3444433394deb811d027cad2bd3ca`. The Worker log explicitly reported no API credits remaining. The saved draft is `3af9b88c-5c47-4ab0-96e8-c5f81e0209e5`, slug `yahoo-test-resource-1`, in the Yahoo workspace. It has no generated body. The spend reservation settled at zero cost and refunded its allowance unit; the usage log records zero tokens and zero cost. This is not a successful generation or proof that API billing is available.

The provider classifier previously treated every HTTP 429 as temporary congestion. The test-branch fix recognizes `insufficient_quota`/`credit_balance_exhausted` separately and uses a fixed message explaining the service balance or spending limit. Regression tests distinguish temporary rate limiting from billing exhaustion and keep provider prose and keys out of customer responses.

Fix commit `3d73da8c77489e64bd6569644d8060aaedd3e9f2` was pushed to this test branch and deployed only to `kindred-ease-space-test`. Worker version `5da5d482-40e3-45e8-8d49-665bed76d38c` serves 100% of traffic, and `/api/public/version` reports that exact commit. Both runtime secrets remain present. A second real request, retrying the same saved Yahoo draft, again failed because API balance is exhausted. The deployed UI and new usage-log row now report the correct quota-exhaustion message/code. Across both calls the database records zero tokens, zero cost, and the full 20-unit Yahoo allowance. No successful generated body exists.

The provider suite passed 118 checks, customer-message suite 83, and metered AI-flow suite 109. TypeScript, the production build, the test-target Wrangler deployment dry run, dependency-registry guard, and diff checks passed. The existing model, draft-flow, template-contract, grounding, auth-landing, and tenant-template suites also passed during setup. Offline checks are not counted as any of the 18 real generations. An anonymous HTTP inventory read returned status 200 with zero rows.

The required test matrix remains incomplete while the dedicated key's API balance is exhausted:

| Account | Resource Article 1 / 2 / 3 | Category Page 1 / 2 / 3 | City Hub 1 / 2 / 3 |
| --- | --- | --- | --- |
| Yahoo | Failed twice (API balance) / pending / pending | pending / pending / pending | pending / pending / pending |
| Gmail | pending / pending / pending | pending / pending / pending | pending / pending / pending |

All 18 successful real generations, their saved editor views, generated-page isolation through direct links and authenticated API calls, and a newly issued confirmation-link redirect must still be verified. Existing confirmed-account timestamps do not prove the current redirect settings. No credits were purchased, plans upgraded, passwords changed, accounts deleted, live billing changed, or live Workers deployed.

## Reconstructed test database

The test database was initialized on October 13, 2026. It has 131 application tables with RLS enabled, no real users, one ownerless internal reference workspace, and zero active scheduled jobs. No customer rows, production user IDs, or production secrets were copied.

The archive `.lovable/wave-c-bundle/supabase/migrations` contains 103 older setup scripts. Those recover much of the baseline but still omit the current workspace tables and helpers. The test foundation in `supabase/kindred-test/20261013190700_kindred_test_foundation.sql` reconstructs that contract from the generated types and workspace provisioning code. Its defaults and policies are test choices, not an authoritative production snapshot. The original project remains inaccessible through the connected Supabase accounts.

`scripts/prepare-kindred-test-db.py` prepares 70 ordered stages without connecting to a database. It excludes archived customer data, server filesystem operations, superseded pool content definitions, and the original founder's internal grant. Storage bucket definitions and static help configuration are retained. Active migration references are adapted to the test project; every scheduled job is disabled in the same transaction that installs it. The enum addition stays in a separate committed migration before subsequent uses.

To reproduce the prepared chain with Python and pglast installed:

```sh
python scripts/prepare-kindred-test-db.py --output /tmp/kindred-test-schema-chain.json
node tests/kindred-test-schema.mjs /tmp/kindred-test-schema-chain.json
```

Hosted installation used the extensions stage, archived schema, reconstructed foundation, first two active migrations, the pre-enum application batch, a separate enum migration, and the remaining application/hardening batch. A subsequent test-only migration revoked explicit client grants on the server-only integration-secret getter, correcting inherited default function privileges. Local and hosted ACL checks confirm only the service role can call that getter. Do not replay the chain on this initialized database. Normal production migrations still require an authoritative baseline and a separate review.

Local integration checks exercise workspace creation, cross-workspace access, membership takeover, metadata role escalation, private profiles, RLS, and disabled jobs. The local vector, cron, network, queue, and Vault stand-ins do not establish those extensions' real behavior. Hosted DDL succeeded with the actual extensions, and hosted metadata confirms RLS and disabled schedules; end-to-end feature verification is still outstanding.

## Authentication and domain repairs

The Auth email hook now returns a 503 hook error when the provider rejects a send. Its offline integration test exercises a signed provider rejection, accepted send, and forged request. This fixes a real false-success path without claiming delivery to an inbox. Signup copy no longer guarantees that an email was sent. A test email sender has not been configured or verified.

The domain activation handler now reads Cloudflare's actual hostname and certificate statuses for Cloudflare-managed connections. Both must be active, and the existing public routing checks must pass, before activation succeeds. Customer-managed proxies retain their own HTTPS routing check. Lookup failures, mismatched hostnames, and failed database saves cannot report successful activation. The UI refreshes on failed checks and displays their reason. Offline integration tests cover these cases without modifying DNS or sending email.

## Teamstead domain check

The user selected `teamsteadcrew.com` for domain testing. Read-only Cloudflare checks on October 13 confirmed its zone is active in Teamstead Software, its universal certificate is active, and its apex points to `teamstead-crew.pages.dev`. The main website answered HTTPS with HTTP 200.

The existing `seo.teamsteadcrew.com` and `seo-test.teamsteadcrew.com` DNS-only CNAME records point to `proxy.founders.click`, the original service. Both returned HTTP 403 with Cloudflare error 1014 when their domain-test route was requested. Cloudflare identifies 1014 as a prohibited cross-account CNAME connection; the target service must onboard it correctly through Cloudflare for SaaS. This is an observed routing failure, not proof of a missing certificate. A wildcard certificate in the Teamstead zone does not establish the target's custom-hostname readiness. The connected account does not expose the `founders.click` zone.

Use the existing `seo-test.teamsteadcrew.com` hostname for the isolated repair after the new app and edge have been deployed and checked. No Teamstead DNS records or live website routes have been changed by this repair. See [Cloudflare's error 1014 guidance](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1014/).

## Remaining deployment configuration

Browser/runtime public variables target the new project. The public publishable key is client configuration. `SUPABASE_SERVICE_ROLE_KEY` must be installed securely in the test Worker's secret store before database-backed server actions can run; it is not available from the current connector and has not been committed. Never reuse the original service's keys or expose a server key in browser variables.

Email, billing, AI, and SaaS customer-domain provisioning require their own test configuration. The existing deployment workflows target the original Founders application and must not deploy this test branch. The separate edge Worker is not deployed or configured yet. Deploy the app and verify its own URL before connecting a test hostname. Do not replace the live Teamstead Pages site as part of an isolated test.

## Validation

- Test-project browser build and Wrangler deployment dry run passed before these repairs.
- The repaired app's TypeScript check and production build passed.
- Auth email provider failure and domain activation integration checks passed without external sends or DNS changes.
- All 70 prepared SQL stages passed the local security/provisioning checks; hosted DDL also succeeded.
- Hosted metadata confirmed 131 application tables, RLS on all of them, zero real Auth users, and zero active cron jobs.
- Security advisor notices concern intentional server-only tables with no client policies and callable definer RPCs. Their authorization must remain part of feature validation; there were no disabled-RLS errors. See [Supabase's definer function advisory](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).
