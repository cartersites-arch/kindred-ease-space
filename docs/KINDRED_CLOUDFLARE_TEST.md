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

The test Worker exists, but has not been deployed and its public subdomain is disabled. The URL above is not a verified running site.

## Current test database and blockers

The separate `Kindred Ease Isolated test` project is active and healthy in Teamstead Software:

- Project reference: `jwqldxatoyeobnoibdvl`.
- API URL: `https://jwqldxatoyeobnoibdvl.supabase.co`.
- Organization: `snagaijhkasuimqkdpcc` (Teamstead Software).
- `supabase/config.toml`, the Worker runtime variables, and the example browser build variables now target this same isolated project.
- The enabled publishable key is public client configuration. No service-role key has been committed.

The database is empty. The repository's 67 SQL migrations are updates to an existing database, not a complete bootstrap: they do not create the original `workspaces`, `workspace_members`, `content_plan`, or `user_roles` tables, and require existing helpers such as `has_role`. Git history did not contain the missing workspace definition either. No application migrations have been applied to the test project.

A read-only attempt to inspect the original project's schema through the Teamstead connection returned `You do not have permission to perform this action`. Access to the new test project works. Reauthenticating an unrelated PMS connection does not resolve this missing schema.

Before database-backed testing, obtain an authoritative **schema-only export** from the original Kindred Supabase project, including tables, types, functions, triggers, grants, and RLS policies. Do not copy customers, user accounts, or production secrets. Inspect the snapshot's outbound hooks before importing it. If the snapshot is the current schema, do not replay migrations already represented in that snapshot.

The copied historical migrations also schedule network calls to the original Founders application and database. Those schedules have not been installed. Any test bootstrap must replace the original endpoints with the isolated test endpoints and leave scheduled jobs disabled until their test credentials and behavior are verified.

The new project's server-only `SUPABASE_SERVICE_ROLE_KEY` is also still needed in the test Worker's secret store. Copy it privately from this test project; never reuse the original database's key or put it into frontend variables.

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

The Teamstead Sales Hub and PMS maintenance projects belong to different applications and are not Kindred test backends. All Kindred test database writes must target `jwqldxatoyeobnoibdvl`.

Email, billing, AI generation, and customer domain provisioning each need their own test configuration before those features can be exercised.

## Deployment path

The copied `deploy-app.yml` and `deploy-edge-worker.yml` workflows target the original Founders application. They are not the deployment path for this test branch. A test deployment must use the generated `kindred-ease-space-test` Worker configuration and the Teamstead Software account.

This branch does not configure customer domain routing or deploy the edge proxy.

## Validation completed October 13, 2026

- Locked dependency installation and the dependency registry guard passed.
- The earlier production build passed with offline placeholder Supabase settings. A subsequent build passed using the new isolated project's actual URL and publishable key.
- Generated Worker settings matched the test Worker, Teamstead account, and application URL above.
- The built browser assets contained no reference to the copied original Supabase project.
- Wrangler type generation and the earlier deployment dry run passed. A subsequent deployment dry run passed with the new isolated database settings (378 server modules and 1,060 static assets).

These checks validate the build and hosting configuration. Signup, database access, billing, email, and AI behavior require the missing database schema and server secret described above. The test Worker resource has been created, but no application version has been deployed.
