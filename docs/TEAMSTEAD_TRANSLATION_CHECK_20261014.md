# Teamstead Maintenance Hub translation follow-up

Target: Teamstead Software / Teamstead Sales Hub `fhqmnlpgqslllzrovxbp`, Edge Function `company-hub`, commercial frontend `pms-company-hub.pages.dev`. Internal PMS resources and Kindred runtime are unchanged.

The production translation handler requires `GEMINI_API_KEY` (also accepts the legacy case spelling). The project Secrets UI showed no custom secrets, so translation exits unavailable before reaching the provider. No secret values were read or copied.

A second defect was found: `hub_assistant_allow` was absent from the company proxy RPC allowlist. Translation calls this usage limiter on uncached text, causing the proxy to reject its own request. Added this one RPC to the allowlist; it still routes to the resolved company's prefixed function. The existing authentication, billing gate, CORS rules, rate limiter and private cache remain intact.

A local regression reproduces HTTP 503 before the change and HTTP 200 afterward with a mocked provider. It also checks rejection of invalid authentication and untrusted origins, and company-prefixed translation/quota calls. These tests verify routing, not real translation quality.

Deployed the exact current production source with this single allowlist addition to `company-hub` version 5, SHA-256 `4ec37c4d6833d5e3215cf676405ef085246a9c6a1fc48b0f9cc8725ee1ae2a95`. Retained the existing custom authentication and `verify_jwt=false`. Source snapshot is archived beside this report; it is not part of the Kindred application build.

At this initial check, a usable dedicated Gemini API key was missing. Google AI Studio's API keys page returned “An unknown error occurred” on initial load and one reload. No key was created and no billing was changed. The user subsequently chose free private on-device translation instead; the deployed solution does not require this secret.

The subsequent implementation and real bidirectional browser/database tests are recorded in [TEAMSTEAD_OFFLINE_TRANSLATION_20261014.md](TEAMSTEAD_OFFLINE_TRANSLATION_20261014.md). That report supersedes this initial key blocker.
