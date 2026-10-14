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
| Custom routes | Only `seo-test.teamsteadcrew.com` (custom domain) |

The test app is deployed and its public URL responds. See the verification update below for current evidence; the earlier setup sections retain their historical context.

## Completed end-to-end test result

All requested tests passed on October 13, 2026: **18/18 real Standard-model generations**, saved private editor/preview views in the correct workspace, **bidirectional database and authenticated application read/edit isolation**, and a **fresh signup-confirmation email and redirect**. The tables below list every generated page, its tokens, and recorded cost. Total successful usage was 15,790 input tokens, 11,186 output tokens, and **$0.005273** recorded API cost. Provider failure calls are excluded from the success count.

The two generation accounts remain `cartersites@yahoo.com` and `jarhead4zoe@gmail.com`. The additional signup-confirmation account, `jarhead4zoe@me.com` (`c43b4bac-bfa1-42d0-b946-11475e979b2a`), was created without deleting or changing those accounts. Signup returned HTTP 200 at **10:55:55 PM Pacific**, confirmation returned HTTP 303 with `user_signedup` at **10:59:07 PM Pacific**, and the browser landed at `https://kindred-ease-space-test.pms-chat.workers.dev/app#`, signed in as the new account. Its own owner workspace is `ade88511-1e19-47ba-919d-ce5715af82ae`, showing zero listings and zero pages, distinct from both generation workspaces.

Resend reports email `01a138fb-4b80-765d-98eb-8731f36489ef`, subject **Confirm your email address**, recipient `jarhead4zoe@me.com`, as **delivered**. The new account's confirmation and sign-in timestamps independently match the verification request. The test sender is saved only in the isolated Supabase project, with a verified dedicated `auth-test.teamsteadcrew.com` domain. No secret or confirmation token was read, printed, or committed. No remaining blocker exists for the requested generation, isolation, and email-confirmation tests. This does not certify unrelated publishing, live billing, real inventory sync, or inbox placement.

## Connected website subdomain

### Additional @me.com city and category drafts

After connecting the domain, the user requested a city hub and category page in the `jarhead4zoe@me.com` workspace. It had no listings, so three clearly labeled fictional Garden Tools listings were added in fictional Test Cedar City, with USD daily prices of $10, $20, and $30 and placeholder `example.com` URLs. No real booking or service is offered. Two additional real Standard (`gpt-5-nano`) generations succeeded, saved, and reopened after full reload with the correct three listings:

| Type | Title / slug | Page ID | Input / output tokens | Recorded USD cost |
| --- | --- | --- | --- | --- |
| Category | Test Garden Tools — Category Page / `test-garden-tools` | `6054f8c1-a2c2-4be2-b2c0-f40d21f3a0d8` | 819 / 455 | 0.000223 |
| City hub | Test Cedar City — City Hub / `test-cedar-city` | `ec7e0aaa-5cb5-4b8e-9c3b-9114d64812fc` | 830 / 442 | 0.000219 |

Both belong to workspace `ade88511-1e19-47ba-919d-ce5715af82ae`, have generation state `ready`, and remain **private drafts**. Neither was published. These two follow-up generations cost **$0.000442** and are separate from the original 18-run test matrix. The custom domain's public sitemap still has zero published URLs.

The user subsequently selected **`seo-test.teamsteadcrew.com`** and explicitly assigned its public pages to **`jarhead4zoe@me.com`**, workspace `ade88511-1e19-47ba-919d-ce5715af82ae`. The old DNS-only CNAME to `proxy.founders.click` was replaced with a Cloudflare custom domain attached directly to **`kindred-ease-space-test`**, custom-domain ID `2726c67b50b6c0783bc288f9848564ffd6ac9899`, certificate ID `5285d0c4-079b-4866-9574-7e514aad624d`. The exact hostname is now in the test Wrangler configuration and deployment guard; no wildcard route is authorized. The ownership TXT record `_founders-click.seo-test.teamsteadcrew.com` was added with record ID `beba0b8c2383cf1b7c89eacf48fcfe25`.

The workspace connection uses owner-managed routing (`customer_proxy`) because Cloudflare already directs the hostname to the isolated app. Verification now reads the connection type, still proves ownership, and does not attempt shared Founders edge provisioning for that mode. A retry can clear an earlier managed-edge error but does not report activation until the HTTPS route check succeeds. Regression fixtures return only selected database columns, require ownership proof, preserve shared-edge credential requirements, and exercise retry recovery. The `global_fetch_strictly_public` compatibility flag is required for a Worker to test its own custom hostname through public routing; without it, Cloudflare returned HTTP 522 internally while external requests succeeded.

The domain row `a1a65323-d3dd-43b1-8fa0-6dcc0a2f9f48` is **verified, active, health ok**, activated October 13 at 11:33:21 PM Pacific. The real HTTPS probe returns HTTP 200, `host: seo-test.teamsteadcrew.com`, and `tenant: resolved`. Its `/a/sitemap.xml` now returns valid XML with no URLs, correctly reflecting this new workspace's zero published pages. The main `https://teamsteadcrew.com` still returns HTTP 200; only the selected test subdomain and its ownership TXT were changed.

The first real sitemap request exposed a missing `content_pages.workspace_id` in the reconstructed test database. The table had zero rows. Test-only migration `supabase/kindred-test/20261014063731_kindred_test_legacy_content_workspace.sql` adds the required non-null workspace foreign key and index, without assigning global rows, changing grants, or disabling RLS. The test foundation includes the same contract for future reconstruction. Hosted metadata verifies the column, RLS, and zero legacy rows; the real custom-domain sitemap passes after the repair.

Supabase Site URL is now `https://seo-test.teamsteadcrew.com/`. Exact allowed redirects include its `/app` and `/reset-password` plus the existing Workers test `/app`. All settings are confined to project `jwqldxatoyeobnoibdvl`. Domain-handler regression checks, 26 domain-status checks, TypeScript, production builds, and the guarded deployments passed. Source commit `f5a260d9e0ce55fa2e3ab0835127c3208db5493a` deployed as Worker version `b136a94c-2b8a-4b9a-a2d7-be773b5b96ed` before the test-only schema repair and this report update.

## October 13 funded generation results

After the user added $10 to Paul Maurer Shows, the installed dedicated test key successfully generated real content. The earlier quota failures below are historical. No purchase or billing change was performed by the agent. All nine Yahoo drafts below used Standard (`gpt-5-nano`), are saved in workspace `0d787190-6320-49f5-b04e-25bd548cb03b`, have generation state `ready`, and opened in their editor with the real private template preview. Each category and city draft also reopened after a full reload, showing exactly its three matching fictional listings and $10–$30 daily prices.

| Type / run | Saved page ID | Input / output tokens | Recorded cost (USD) |
| --- | --- | --- | --- |
| Resource 1 | `3af9b88c-5c47-4ab0-96e8-c5f81e0209e5` | 1007 / 783 | 0.000364 |
| Resource 2 | `7bc9e008-c5a7-4dfa-b846-c4b41f3e1e3c` | 1009 / 1720 | 0.000739 |
| Resource 3 | `16fa803a-fb5f-4c31-8131-20a9e397983a` | 1012 / 783 | 0.000364 |
| Category 1 (Camping Gear) | `e247dcbf-25a9-4752-a88e-a4802a5f5310` | 814 / 416 | 0.000208 |
| Category 2 (Garden Tools) | `c9fb0e8b-7d9c-4ff9-961d-7f34cc61d3a2` | 807 / 402 | 0.000202 |
| Category 3 (Party Supplies) | `d52addea-d380-4386-80b4-2b842ae22f78` | 806 / 490 | 0.000237 |
| City 1 (Test Pine City) | `7d6f268c-c120-4ae2-ba1a-821c9b449b95` | 822 / 561 | 0.000266 |
| City 2 (Test Cedar City) | `262cbff4-c8c7-4eea-82fe-b43e9c5b3dcf` | 821 / 464 | 0.000227 |
| City 3 (Test Maple City) | `f4f48f13-c261-45d6-b85f-10b1d6d6bbb2` | 820 / 433 | 0.000215 |

Total recorded cost for these nine successful generations is **$0.002822**. This is the application's recorded provider usage cost, not a retrieved billing invoice. No pages were published. A hosted authenticated-role check confirmed Gmail can read zero Yahoo pages and has no direct UPDATE privilege on `tenant_pages`.

After secure sign-in as `jarhead4zoe@gmail.com`, all nine Gmail runs also generated real content, saved in workspace `d588a61c-a6cc-45f0-89ca-0135ab6bc9ad`, opened in the correct editor, and reopened after reload. All have generation state `ready` and nonempty bodies.

| Type / run | Saved page ID | Input / output tokens | Recorded cost (USD) |
| --- | --- | --- | --- |
| Resource 1 | `45a27b2a-e7b0-4614-9424-ca4bbcd31a9d` | 1008 / 644 | 0.000308 |
| Resource 2 | `0f99bb46-56d9-4c95-a959-ea860ab1a60d` | 998 / 842 | 0.000387 |
| Resource 3 | `30dc594b-995b-41f6-99a1-459c08c83402` | 1001 / 741 | 0.000347 |
| Category 1 (Camping Gear) | `575fd200-d9c8-4238-830d-9de65ab409e0` | 806 / 456 | 0.000223 |
| Category 2 (Garden Tools) | `0abc9f7d-17e5-4bf8-946c-a87efb68afd9` | 806 / 436 | 0.000215 |
| Category 3 (Party Supplies) | `678d7daa-0def-47cb-acb4-28d372978176` | 803 / 488 | 0.000236 |
| City 1 (Test Pine City) | `7b7d2a13-3347-43c6-91d7-b4bc54203206` | 817 / 601 | 0.000282 |
| City 2 (Test Cedar City) | `7f1bf0e5-7b59-41c8-b420-3b2d0bba49a5` | 817 / 533 | 0.000255 |
| City 3 (Test Maple City) | `0894f9d6-e179-4911-8e9c-24c12c9934f9` | 816 / 393 | 0.000198 |

Gmail's recorded cost is **$0.002451**; the **18/18 successful generations** total **$0.005273**. The isolated database contains nine ready drafts per workspace. Failed quota calls are excluded from this success count.

The test-only `/app/isolated-test` route calls the existing authenticated page handlers with fixed dummy target IDs; it adds no server API or authorization bypass. It is unavailable when the browser Supabase URL or current workspace differs from the isolated test setup. Both accounts' own-page requests succeeded. In both directions, foreign-workspace reads and edits were denied; Worker logs confirm `Forbidden — not a member of this workspace` before content access/write. A foreign page ID paired with the caller's own workspace was denied as nonexistent. Both accounts' direct editor links to the other workspace also showed only the nonexistent-page error. Hosted RLS checks showed nine own pages and zero foreign pages. The target pages retained their original slugs, body lengths, and content versions after attempted edits. These are real authenticated application HTTP requests, not simulated provider or authorization responses.

Probe commit `7b49034a24b9793015d06bc464fe25b9528fb55c` passed TypeScript and the production build, and deployed only to Worker version `774f17c8-6046-4726-be08-30ad450bceea`. The guarded deployment verified that exact public SHA.

The Supabase Auth dashboard verifies Site URL `https://kindred-ease-space-test.pms-chat.workers.dev/` and the sole allowed redirect `https://kindred-ease-space-test.pms-chat.workers.dev/app`. Both original users were already confirmed, so a third disposable signup was used to verify a fresh confirmation link. Its successful delivery, confirmation, and redirect are recorded in the completed result above.

The user's new test signup on October 13 at 10:31–10:33 PM Pacific failed with HTTP 429, `over_email_send_rate_limit`. The project uses Supabase's built-in email sender, whose shared project limit is two messages per hour and cannot be raised without custom SMTP or a Send Email hook. Successful recovery sends were recorded at 9:59:36 PM and 10:06:06 PM Pacific. This is an email-budget blocker, not evidence of an invalid address or a completed confirmation. No new account was retained from these failed sends. The UI now maps this error code to a fixed message explaining the hourly email limit and later retry. No rate limits, SMTP credentials, existing accounts, or billing were changed.

### Dedicated test email sender setup

The user created a free Resend account and explicitly selected `auth-test.teamsteadcrew.com` for the isolated test sender. Resend domain `c25cdbe7-94ac-43c7-aa12-7507e75a7233` is **verified**. Three previously unused names were added in Teamstead Software's `teamsteadcrew.com` zone (`da9c5a42f965d0dc32dcce9e197a28d6`), all DNS-only with automatic TTL:

| Type | Full record name | Purpose / target | Cloudflare record ID |
| --- | --- | --- | --- |
| TXT | `resend._domainkey.auth-test.teamsteadcrew.com` | Resend-generated public DKIM key | `18536155dda7c892999b80be35c9426f` |
| CNAME | `rsend.auth-test.teamsteadcrew.com` | `rsend.forge.rmta.net` | `687c6677c42a8c74f5ebd117328bd6ef` |
| CNAME | `send.auth-test.teamsteadcrew.com` | `send.forge.rmta.net` | `7076909da776812bfd46f3b2467fe292` |

Public DNS queries resolve the signing record and sending alias, and Resend reports the domain verified. No existing DNS record, apex MX/SPF/DMARC record, website route, or other application's sender was changed. Receiving remains disabled. These additions extend the test scope only to the explicitly chosen email subdomain.

The isolated project's SMTP settings are saved with sender `no-reply@auth-test.teamsteadcrew.com`, sender name `Kindred Ease Isolated Test`, host `smtp.resend.com`, port `465`, username `resend`, and minimum per-user interval 60 seconds. A Resend key form named `Kindred Ease Isolated Test SMTP` was prepared with **Sending access**, limited to this domain. The user completed key creation and securely pasted it directly into the isolated Supabase SMTP password field. After reloading the dashboard, custom SMTP remains enabled, the expected host/name persist, and Supabase displays the stored-password notice. The secret was not read, printed, committed, or installed by the agent. Resend reports the domain ready to send. The subsequent signup produced the delivered confirmation email and successful test-domain redirect recorded above.

## October 13 end-to-end verification history

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

On resuming after the user reported readiness, a third real retry returned `insufficient_quota` / `credit_balance_exhausted`, request ID `req_1e9fcccda17446e7b32fd6c7953daf12`. It ran on newer Worker version `a4035074-41ec-4c38-8093-42b875025f12`, whose public source identity had reverted to `dev`. Both OpenAI organizations available in the browser (Paul Maurer Shows and Personal) still displayed $0.00. Across all three attempts, recorded usage and cost remain zero. Billing was inspected without modifying it. The installed secret's owning organization cannot be determined from the Worker secret metadata.

Use `pwsh -File scripts/deploy-kindred-test.ps1` for future test deployments. It refuses other branches, remotes, dirty checkouts, Worker/account/project targets, and unexpected routes; permits only the explicitly authorized `seo-test.teamsteadcrew.com` custom domain; stamps the committed SHA into the browser/server build; preserves runtime secrets; and checks the public version after deployment.

The saved failed draft is visible to Yahoo's database identity and invisible to Gmail's. Both authenticated identities lack direct UPDATE privilege on `tenant_pages`; edits must use the membership-checked application handlers. These checks do not substitute for successful generated-page HTTP tests. The Supabase dashboard was not signed in, so current Auth URL settings and a newly issued confirmation redirect remain unverified.

The required test matrix remains incomplete while the dedicated key's API balance is exhausted:

| Account | Resource Article 1 / 2 / 3 | Category Page 1 / 2 / 3 | City Hub 1 / 2 / 3 |
| --- | --- | --- | --- |
| Yahoo | Failed three times (API balance) / pending / pending | pending / pending / pending | pending / pending / pending |
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
