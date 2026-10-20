# Chat language production release — October 20, 2026

## PMS Chat

- Project: `project-room`
- Production URL: `https://project-room-ekn.pages.dev/`
- Deployment: `01f24943-540f-4026-a1c5-5c689919d98d`
- Previous rollback deployment: `9d03c562-9a46-473e-9fba-956b8d274c7c`
- Patched asset: `assets/index-j1bJW04z.js`
- Patched asset SHA-256: `371dab02d23f17560d835dccf56df2ab2a774eb62e613d9106c9e28967582740`
- Added `pms-reader-control.css` and `offline/hf-worker-quality-v3.js`.
- Live browser verification confirmed the English/Español setting, automatic-translation option, preserved original-text behavior, exact frontend bytes, and signed-out API protection.

## Teamstead Chat

- Project: `teamstead-crew`
- App URL: `https://teamsteadcrew.com/?workspace=1#crew-sign-in`
- Canonical Pages URL: `https://teamstead-crew.pages.dev/`
- Deployment: `f1d5128a-0fb5-4885-a75e-021b2fcf230e`
- Previous rollback deployment: `b2e6f394-1334-4c3f-ace4-85a038be3d4b`
- Patched asset: `assets/index-dYSeq7P3.js`
- Patched asset SHA-256: `ebd93bf73a778e2abf1fb980c5af5faead251eca00006cb49d70711543ead200`
- Live verification confirmed exact frontend bytes, the custom-domain passkey sign-in screen, and signed-out API protection.

## Backend and storage controls

- Both releases reused the exact October 15 backend worker modules; byte comparison rejected any backend difference before release.
- PMS retained D1 `cdfee5d1-76c7-48a9-958d-986703667fa8` and its existing chat, backup, and maintenance photo buckets.
- Teamstead retained D1 `24543c2f-3d1f-4313-b46f-0708b6db28a1` and `teamstead-chat-photos`.
- A separate `teamstead-chat-photo-backup` Worker now runs every 15 minutes into the isolated `teamstead-chat-photo-backups` bucket. Its first run checked, copied, and SHA-256 verified the one existing chat photo with zero missing or failed objects.

The two companies remain isolated. No database migration, permission change, message write, or cross-company data copy was part of this release.
