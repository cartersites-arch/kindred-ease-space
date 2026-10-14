# Professional Teamstead public homepage

Released 2026-10-14 at https://teamsteadcrew.com/. Production Pages deployment: `41732655-120e-4ca2-9466-b8ea0b92c29c`. Previous owner-dashboard deployment: `3da3c249-422e-4071-b085-513aba3e6480`.

## Delivered

- Separate public marketing layout with product navigation, primary Start free trial actions, product descriptions/screenshots, three pricing cards, getting-started steps and FAQs.
- Website copy remains controlled by the existing authenticated website editor. Its approved draft was saved and published through that editor, revision 6. The preceding public copy is backed up as marketing-copy-before.json.
- Prices read from the existing live Stripe catalog using GET only, verified for active live USD fixed licensed recurring prices with interval count one. Only public amounts are cached for five minutes. No key, price ID, customer ID, subscription ID or invoice data is returned by the marketing reader.
- Actual live catalog amounts observed: Chat $15/month or $150/year; Maintenance Hub $29/month or $290/year; combined $39/month or $390/year. The annual amount is billed annually. Prices are before applicable taxes.
- Trial/payment-method/automatic-renewal language explains the existing 14-day trial. No prices, plans, billing rules or subscriptions were changed.
- Actual product interfaces were rendered with purely fictional screenshot fixtures: Northfield Demo Company, Alex Demo, Sam Example, Taylor Demo and two demo equipment requests. Captures are 1280x720 JPEGs. Both images carry a visible fictional-data banner and public captions identify them as demo examples. There are no real customer messages, employees, work photos or signatures.

## Access and compatibility

- New marketing handler accepts only exact canonical HTTPS root GET/HEAD without query parameters, checks the dedicated Teamstead database identity and requires the original access handler to report signed_out.
- Authenticated/setup sessions pass through to the original app handler. Company query URLs, billing, signup and admin/API routes bypass the marketing handler.
- Sign in uses /?workspace=1#crew-sign-in and retains the original app bundle/passkey code. Only this exact workspace-entry HTML gets presentation CSS to hide the old marketing panel.
- Main-workspace invitation fragments at /#access=... are preserved by same-origin routing to /?workspace=1#access=...; ordinary marketing section anchors are unaffected. Company-specific invitation URLs continue through their existing handler.
- Existing app JS/backend bundle was not rebuilt or replaced. The wrapper imports the existing backend. The owner dashboard, protected company data handlers, subscription mappings and database schema remain unchanged.
- Canonical URL and indexable metadata remain on the public homepage. Company and workspace pages remain noindex; existing robots/sitemap and public Kindred product-guide links are preserved.

## Verification

- Marketing route/pricing tests passed: signed-out canonical request, query/private route bypass, authenticated/setup bypass, wrong identity/host fail closed, escaping, HEAD behavior, invitation fragments, verified catalog shape, GET-only provider reads and public-only price cache.
- Existing admin RSA/SQLite checks passed (63), existing revenue checks passed, dashboard status/filter checks passed, public SEO checks passed and Worker build passed.
- Actual live browser verified all three pricing trial buttons navigate to signup with the correct plan radio selected. No company signup was submitted and no subscription was purchased.
- Actual Sign in navigation showed the existing passkey/recovery form.
- Actual public homepage returned HTTP 200 with index metadata, canonical URL, all six verified prices and no private subscription table.
- Both screenshot assets returned HTTP 200/image/jpeg and loaded in the browser. One H1; phone viewport had equal document width/scroll width, with no horizontal overflow. Desktop and phone layouts inspected; final browser had no console errors/warnings.
- Anonymous owner API redirects to Cloudflare Access (302); company Chat and work-order APIs reject anonymous access (401). Owner dashboard still opened under the existing signed-in administrator.
- Named project/account/domain/D1/R2 identity verified before production release: Teamstead Software / teamstead-crew / teamsteadcrew.com / 24543c2f-3d1f-4313-b46f-0708b6db28a1 / teamstead-chat-photos.

The browser could not reach the local fixture server. Temporary screenshot previews were therefore built on a dedicated preview branch of the same Pages project. Their standalone Worker contained fictional data only, used no databases/billing credentials, and restricted browser connections to the preview itself. All four preview deployments were removed after capture, with the production deployment confirmed unchanged. The local server was stopped.

Source snapshots, screenshot fixtures and approved public demo images are archived in docs/teamstead-marketing-home. This is Carter's evidence branch; it is not part of Derek's clean PR #10 and does not change Derek main, PMS or live Founders.

No new live passkey ceremony or paid checkout was performed in this release. Existing protected app code is retained; this release's actual browser checks cover navigation/plan selection, while invitation/session compatibility is covered by the route tests. Search Console submission and Google indexing/ranking are separate from this website release.
