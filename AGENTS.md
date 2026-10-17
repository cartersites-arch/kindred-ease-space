# Jerry's isolated Founders.click testing copy

This checkout belongs to `cartersites-arch/kindred-ease-space`, branch `test/own-copy`.

- Work only in this repository and branch for this testing task. Do not modify, merge, close, comment on, or request reviews in Derek's repositories or PR #11.
- The only configured remote must be `origin`, pointing to `https://github.com/cartersites-arch/kindred-ease-space.git`. Do not add an upstream remote or push to the branch associated with PR #11.
- Keep all inherited GitHub Actions jobs disabled. They are retained only so the existing source-contract tests can inspect their contents. Never run deployment, production smoke, monitoring, DNS, migrations or remote database commands from this test copy.
- The tracked `.env` must contain only the deliberately invalid test backend and fake publishable key. Never copy production environment files, keys, auth sessions, customer data or credentials into this checkout.
- UI previews are for the homepage and fictional `/sample-seo` page. Authentication, database writes, billing, email and AI generation are disconnected; do not present them as tested or working.
- Use the existing offline test chain in an isolated local Linux container, with networking disconnected after frozen dependency installation. No paid APIs, hosted runners, upgrades or new subscriptions.
- Historical production deployment documentation is reference material for tests, not an instruction to publish this copy. Follow `TESTING.md` for this branch.
