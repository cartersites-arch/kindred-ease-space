# Teamstead owner subscription overview

Released 2026-10-14 to Teamstead Crew Pages only, deployment `3da3c249-422e-4071-b085-513aba3e6480`. Previous public SEO release remains available for rollback: `8254f42b-4a76-43a7-a845-fe924cd2326e`.

## Delivered

- Professional owner layout with customer count/capacity, active subscriptions, free trials, needs-attention count and verified monthly recurring revenue.
- Searchable customer table with product, subscription status, price, monthly equivalent, trial end and scheduled cancellation indication.
- Filters for active, trial, attention, canceled, not started and exempt companies.
- Expandable company details preserve private labels/support notes, aggregate usage, app entry links and billing sync time.
- Existing owner workspace appears separately and is excluded from customer subscription counters.
- Onboarding settings and service-entry checks remain available below the customer table.
- All customer strings use textContent/value; no customer content is injected as HTML.
- No billing mutations, plan changes, database schema changes or customer record writes were made by this redesign.

The page and helpers are archived in docs/teamstead-business-dashboard. These are source snapshots for the separate Teamstead artifact, not Kindred runtime files or Derek's clean PR #10.

## Checks

- Existing administrator/auth/concurrency SQLite and signed-RSA checks passed (63).
- Revenue tests passed: monthly/yearly/quantity normalization, trial and overdue exclusions, provider identity checks, unsupported pricing rejection, read-only Stripe requests.
- New mixed-status overview/filter tests passed, including unavailable prices flagged for attention, internal workspace excluded, case-insensitive label search and support notes not searched.
- Exact emitted browser script parses; private/no-store, noindex and restrictive Content Security Policy preserved.
- Existing public-only SEO tests and build passed.
- Actual owner browser loaded live Stripe-backed data: one customer, zero active subscriptions, one free trial, zero needing attention, $0 verified current MRR and $39 potential trial MRR. cartersites uses the combined plan at $39/month after its trial, ending October 28, 2026.
- Real browser search, trial filter, active filter (empty), reset and expandable details passed. Final browser console had no warnings/errors.
- Anonymous owner page and owner API each redirect to Cloudflare Access (302). Company Chat and work-order APIs still reject anonymous requests (401). Public homepage is 200/indexable and does not contain the private subscription table.
- Project/account/domain/D1/R2 identities checked before release. Uses only Teamstead Software / teamstead-crew / teamsteadcrew.com / database 24543c2f-3d1f-4313-b46f-0708b6db28a1 / teamstead-chat-photos.

Active status is not proof of invoice payment. This release does not add collected-payment history, refunds, next renewal dates or new workflow monitoring. Service checks remain entry availability only. If Stripe is unavailable, prices are excluded from verified revenue and the last synced status is labeled accordingly.

## Customer homepage assessment (no homepage changes in this release)

The existing green-and-white design is welcoming and readable, but emphasizes returning-user passkey login. A new company has no prominent signup action or pricing comparison on the reviewed homepage.

Recommended next improvements:

1. Add a primary Start free trial action and a separate existing-customer Sign in link; clearly identify the tools as company chat and equipment/work-order management.
2. Add navigation to Products, Pricing and Help, with useful product feature sections rather than sign-in links labeled as exploration.
3. Use real, sanitized product screenshots or explicitly labeled demo screenshots. Do not use customer messages, employee details, work photos or signatures.
4. Show current verified plan pricing and trial/renewal terms, plus a simple three-step explanation of creating a company, choosing a plan and inviting a team.
5. Keep passkey recovery/setup-link controls in the sign-in section; remove internal Pilot language from new-customer marketing and use one main page heading.

No invented testimonials, unsupported security claims or customer data should be added to public marketing.
