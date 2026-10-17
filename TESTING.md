# Jerry's own Founders.click testing copy

Repository: https://github.com/cartersites-arch/kindred-ease-space/tree/test/own-copy

Use branch `test/own-copy`. It includes the product screenshot and fictional public `/sample-seo` page. It is separate from `codex/product-screenshot-sample`, the branch referenced by PR #11. Pushing here does not update that PR. Do not open a new PR into another owner's repository.

## What works here

- Homepage and sample-page UI review, responsive layout, copy, image and navigation checks.
- The full offline `bun run test` release chain, TypeScript, lint and production compilation in a local Linux container.

## Isolation

All inherited workflow jobs are unconditionally disabled on this branch, including app/edge deployment, production monitoring and live smoke. Their source is retained for the existing contract tests. No automated cloud runners or deployments are needed.

The tracked environment uses `https://founders-test.invalid` and an explicitly fake publishable key. It does not point to the original Supabase database. Do not enter real customer data or sign up expecting a working account. Login, billing, email, database persistence, domain connection and AI generation require a separate test backend and are intentionally disconnected here. Do not add paid APIs or upgrades.

Keep this repository's only remote pointed at your own copy. `AGENTS.md` records the testing boundary for future assistants. Historical production deployment documents remain only as test/reference fixtures; do not follow their release steps in this copy.

## Local commands

After installing the locked public dependencies (`bun install --frozen-lockfile`), run `bun run dev --host 127.0.0.1 --port 4323` to inspect the homepage and `/sample-seo`. The invalid backend means backend-dependent pages will not work. Use local Linux Docker for the complete `bun run test` chain because the inherited generated-import harness does not support Windows paths.

The original screenshot/sample implementation passed all 79 suites on Linux before this branch's isolation changes. The isolation changes require their own verification; see the saved test report accompanying the setup.
