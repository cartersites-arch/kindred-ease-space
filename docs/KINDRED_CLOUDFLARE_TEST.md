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

The Worker resource exists, but no application version is deployed and its public subdomain is disabled. These URLs do not establish a working app.

## Reconstructed test database

The test database was initialized on October 13, 2026. It has 131 application tables with RLS enabled, no real users, one ownerless internal reference workspace, and zero active scheduled jobs. No customer rows, production user IDs, or production secrets were copied.

The archive `.lovable/wave-c-bundle/supabase/migrations` contains 103 older setup scripts. Those recover much of the baseline but still omit the current workspace tables and helpers. The test foundation in `supabase/kindred-test/20261013190700_kindred_test_foundation.sql` reconstructs that contract from the generated types and workspace provisioning code. Its defaults and policies are test choices, not an authoritative production snapshot. The original project remains inaccessible through the connected Supabase accounts.

`scripts/prepare-kindred-test-db.py` prepares 70 ordered stages without connecting to a database. It excludes archived customer data, server filesystem operations, superseded pool content definitions, and the original founder's internal grant. Storage bucket definitions and static help configuration are retained. Active migration references are adapted to the test project; every scheduled job is disabled in the same transaction that installs it. The enum addition stays in a separate committed migration before subsequent uses.

To reproduce the prepared chain with Python and pglast installed:

```sh
python scripts/prepare-kindred-test-db.py --output /tmp/kindred-test-schema-chain.json
node tests/kindred-test-schema.mjs /tmp/kindred-test-schema-chain.json
```

Hosted installation used the extensions stage, archived schema, reconstructed foundation, first two active migrations, the pre-enum application batch, a separate enum migration, and the remaining application/hardening batch. Do not replay the chain on this initialized database. Normal production migrations still require an authoritative baseline and a separate review.

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
