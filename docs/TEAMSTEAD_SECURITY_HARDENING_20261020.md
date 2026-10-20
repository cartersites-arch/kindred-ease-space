# Teamstead security hardening — 2026-10-20

Production Maintenance Hub deployment: `2f2aa0da-1494-40ca-bdfb-63e89e26cec2`

- Raised the `teamsteadcrew.com` minimum TLS version from 1.0 to 1.2.
- Enabled Always Use HTTPS.
- Enabled HSTS for six months without subdomain or preload expansion.
- Changed the Maintenance Hub offline inspection queue from persistent local storage to tab-scoped session storage.
- Migrated any queue left by an earlier build into the active tab once, then removed the persistent copy.
- Preserved `X-Frame-Options: DENY`, private no-store caching, private bearer-link handling, and the existing CSP.

Live verification returned HTTP 200, `X-Frame-Options: DENY`, `Cache-Control: no-store`, the migration boot code, and a bundle that uses session storage without the prior persistent queue call.

The prior production deployment remains available for rollback: `dc2e6a82-aba7-461a-8924-bb7eb7d644e5`.
