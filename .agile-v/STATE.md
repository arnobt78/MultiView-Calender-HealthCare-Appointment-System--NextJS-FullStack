# Agile V — Living State

<!-- Updated: 2026-06-11 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C19** — organization list UI polish |
| **Phase** | Verify |
| **Stage** | 4 |
| **Status** | verify PASS |
| **Last Updated** | 2026-06-11 |
| **Parent REQ** | REQ-0064 |

## Verify baseline (C19 close)

**961/961** (192 files) · tsc · lint · build — PASS

## C19 scope

- `indigoGlassTableFrameClass` — patient/violet table shell parity.
- Columns: `EntityTitleLink`, `UserRoleBadge`, `OrganizationMembersRoleBadges`, muted typography, amber outstanding.
- Billing filter width; vertical `EllipsisVertical` actions menu.
- Demo seed: `test@patient.com` as org member role `patient`.

## C18.2 scope (shipped)

- `useOrganizationDetail` hook; `organization-detail-client.ts`; enriched POST members.
