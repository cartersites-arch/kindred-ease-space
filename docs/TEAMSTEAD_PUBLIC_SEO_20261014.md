# Teamstead public marketing and private company access

Verified 2026-10-14. This archive belongs only to Carter's isolated test branch. It is not part of Derek's clean PR #10.

## Released changes

- Teamstead Crew Pages deployment `8254f42b-4a76-43a7-a845-fe924cd2326e` exposes the canonical anonymous marketing homepage to search engines, adds a description and canonical URL, and links to the two product guides.
- Real robots.txt and sitemap.xml responses replace the SPA fallback at teamsteadcrew.com. The homepage sitemap contains only the public homepage.
- The SEO transform is restricted to GET/HEAD on the exact canonical root without query parameters or cookies and verifies the dedicated Teamstead database identity. Other original-handler responses remain noindex. Existing authentication, billing and company handlers remain intact.
- Existing Kindred pages were rewritten manually and published through the actual editor in jarhead4zoe@me.com's Teamstead Software workspace. No additional AI generation call was made for these edits.
- Chat: https://seo-test.teamsteadcrew.com/a/teamstead-chat (page 484992a0-d1f5-4682-9338-09f955e6baa4).
- Maintenance: https://seo-test.teamsteadcrew.com/a/maintenance-hub (page d499347d-0622-4d71-bdf0-cb593477fdba).
- Both guides have product-specific titles, descriptions, canonical URLs, practical feature explanations, FAQs, mutual links and links to Teamstead signup. Content does not include customer messages, jobs, employee details, photos or signatures.
- Isolated Kindred Worker version `2df14db3-06ab-4bfd-9f7a-144685f4e3a2`, code commit `50ecde1af7a640bdebda23894c3e6b95319a0752`, restricts robots to published /a/ pages and advertises https://seo-test.teamsteadcrew.com/a/sitemap.xml. Runtime secrets were preserved.

## Verification

- Public SEO unit tests passed, including exact host/path/query/cookie restrictions, database identity, original scripts retained, robots/sitemap and HEAD parity.
- Existing site-admin signed-RSA/SQLite tests passed (63 checks); Teamstead build passed.
- Kindred production build passed. Deployment guard checked Carter repository, test branch, named Worker, account, route and isolated Supabase project. The immediate version check briefly observed the prior build; a subsequent actual HTTPS check matched the full deployed commit above.
- Anonymous homepage: HTTP 200, meta robots index,follow, X-Robots-Tag index, follow, canonical root and guide links.
- Company URL shell: HTTP 200 with noindex metadata/header, no added marketing footer.
- Anonymous company Chat state and work-order API requests: HTTP 401, sign-in-required JSON and noindex headers.
- Anonymous owner dashboard: HTTP 302 to Cloudflare Access login. Company-admin shell remains noindex and does not grant company API access.
- Both product guides: HTTP 200, correct search titles/canonical URLs, no noindex directive, actual published bodies verified in browser.
- Both Kindred hostnames return the corrected robots file. Customer-domain sitemap contains only four published software guides; dummy city/category pages are absent.
- Anonymous Kindred /app returns the app authentication shell with noindex metadata; published guides are the search-facing content.

The archived public-seo module, test and worker wrapper are in docs/teamstead-public-seo. They are source snapshots for the separate Teamstead artifact, not Kindred runtime files.

## Limits and next step

This removes crawling/indexing blockers and publishes useful marketing content. Google indexing or ranking has not been observed or promised. Search Console ownership verification and sitemap submission have not been performed. No live customer data, billing settings, Derek main, PMS or live Founders resources were changed by this release.
