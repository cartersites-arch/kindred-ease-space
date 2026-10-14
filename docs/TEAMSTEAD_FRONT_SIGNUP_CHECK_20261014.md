# Front-page signup and existing-trial app check

Verified October 14, 2026 through the actual production browser UI.

## New company

Clicked the combined plan's Start free trial button on the new homepage. Created `TEST — Front Page Signup 2026-10-14` (`c_928e27958c1f41c0`) with owner Jerry Carter. Automatic provisioning reached the real passkey setup screen. The user created the passkey directly on their device; the app then reached authenticated company billing. The business-owner dashboard changed the company from Owner setup needed to Ready.

This new company remains unsubscribed (Not started). The user explicitly chose to use their existing cartersites trial for the app checks, rather than start a second $39/month subscription. No checkout was initiated or purchased for the new company. It remains a registered test company using one capacity slot.

## Chat in existing cartersites trial

Company `c_995879ad6a2744f6`, existing `TEST Manager — Fictional` account. Posted a plainly labeled dummy message in general:

> TEST ONLY — Front-page verification 2026-10-14. Dummy Chat message to confirm saving and reopening in cartersites. No real work or customer information.

The message survived a browser reload and channel reopening. Reload occurred before the initial send acknowledgement, so the composer offered its safe retry. Retry resolved confirmation to Sent — saved in this conversation; only one matching message was visible.

## Maintenance Hub in existing cartersites trial

Opened the company Hub through the actual Chat navigation. Verified cartersites company label and the existing fictional test account's Manager role. Submitted a dummy work request on the existing TEST — Onboarding Equipment record. The description explicitly states that no real defect, repair, safety inspection or maintenance work is claimed. Used the application's supported Photo unavailable option with an honest explanation that this virtual software test has no physical defect to photograph.

The app confirmed TS-2 created. Opened its status, reloaded, and verified its description, requester and photo-unavailable explanation persisted. Opened Manager Review and confirmed TS-2 appeared in Needs review (1) and Approvals (1), with a Manage TS-2 control.

TS-2 remains Awaiting review and unassigned. Assignment, parts ordering, completion-photo upload, electronic signature and final inspection were not repeated in this check. No physical maintenance was certified. No signature was fabricated.

Automatic Spanish description translation displayed unavailable, with the original text preserved. This is a remaining feature issue; it did not prevent saving, reopening or manager-queue routing. No AI answer, translation success or voice/video call is claimed.

## Privacy and billing evidence

- Anonymous new-company Chat request returned 401/sign-in required. Work-order endpoint returned 402/subscription required, with no work records returned.
- Existing cartersites subscription remained a free trial at $39/month after the trial, ending October 28; new company remained Not started in the dashboard. Customer count is now two.
- The newly created company and dummy message/request were not published on the marketing site. Existing companies/accounts were not deleted. No keys, passkeys, billing settings, application code or production schema were changed by this test.

Local screenshot evidence is kept in the Teamstead artifact's capacity-test folder, not public homepage assets: new-front-signup-passkey-ready.jpg, new-front-signup-billing-required.jpg, front-flow-chat-persisted.jpg and front-flow-maintenance-manager-queue.jpg.

These results verify new-company registration/passkey onboarding plus live Chat and maintenance-request smoke checks in the existing trial. They are not a full new-company subscribed end-to-end or final maintenance-certification test.
