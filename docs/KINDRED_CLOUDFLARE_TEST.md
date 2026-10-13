# Kindred Ease Cloudflare test configuration

This branch prepares `cartersites-arch/kindred-ease-space` for its own test Worker in the Teamstead Software account.

| Setting | Value |
| --- | --- |
| Branch | `test/cloudflare-kindred-ease-20261013` |
| Worker | `kindred-ease-space-test` |
| Account | Teamstead Software (`0e91333c6994f692c3cb0e2d0e0efa02`) |
| Worker URL after deployment | `https://kindred-ease-space-test.pms-chat.workers.dev` |
| Custom routes | Empty |
| Application URL | The test Worker URL above |

The test Worker URL is a planned deployment address, not a verified running site.

## Build and verify

Install the repository's locked dependencies with Bun 1.3.3:

```sh
bun install --frozen-lockfile
```

Configure these build variables for a separate Kindred test Supabase project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Build and inspect the generated Worker configuration:

```sh
bun run build
```

The build must emit `.output/server/wrangler.json` and `.wrangler/deploy/config.json` targeting `kindred-ease-space-test`. Validate the generated bundle with Wrangler's `deploy --dry-run` before deployment.

## Runtime connection required

The copied tracked environment file that pointed to the original Founders Supabase project was removed from this test branch. Provide test values locally in an ignored environment file or through the deployment environment.

A separate Kindred test Supabase project's runtime secrets are required for account and workspace testing:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Keep the service role key in the Worker's secret store. The browser only receives the publishable key. Use the same test project for the build and runtime connections.

The Teamstead Sales Hub and PMS maintenance projects belong to different applications and are not Kindred test backends. No Kindred test database was created during this configuration work.

Email, billing, AI generation, and customer domain provisioning each need their own test configuration before those features can be exercised.

## Deployment path

The copied `deploy-app.yml` and `deploy-edge-worker.yml` workflows target the original Founders application. They are not the deployment path for this test branch. A test deployment must use the generated `kindred-ease-space-test` Worker configuration and the Teamstead Software account.

This branch does not configure customer domain routing or deploy the edge proxy.

## Validation completed October 13, 2026

- Locked dependency installation and the dependency registry guard passed.
- The production build passed with offline placeholder Supabase settings.
- Generated Worker settings matched the test Worker, Teamstead account, and application URL above.
- The built browser assets contained no reference to the copied original Supabase project.
- Wrangler type generation and deployment dry run passed.

These checks validate the build and hosting configuration. Signup, database access, billing, email, and AI behavior require the separate test connections described above. No Worker was deployed during these checks.
