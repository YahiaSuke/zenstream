# Bug Report Log: StreamFlow (Netflix Web Clone)

Systematic QA audit tracking issues, severity classifications, and resolutions across all user flows.

---

### BUG-001: Duplicate Watchlist Add on Rapid Multi-Clicks
- **Severity**: S3 (broken with a workaround, or visibly wrong)
- **Flow / case**: F04 / F04-N1
- **Screen**: S05 (Details Modal), S09 (My List)
- **Build**: 1.0.0-rc1  Browser / device: Chrome / All viewports
- **Steps**:
  1. Open Title Details modal for "Neon Vanguard".
  2. Rapidly double-click or triple-click the "＋" (Add to My List) button.
- **Expected**: Single unique entry added to watchlist.
- **Actual**: In early draft, array appended duplicate IDs causing duplicate rendering cards.
- **Evidence**: `e2e/test-runner.js` test case `F04-N1`.
- **Suspected cause**: Lack of Set / unique index check in early in-memory data store array.
- **Status**: **Fixed** in `lib/db.js` using `unique(profile_id, title_id)` and array inclusion check. Verified in `e2e/test-runner.js`.

---

### BUG-002: NaN Time Display on Unloaded Video Scrub
- **Severity**: S4 (cosmetic)
- **Flow / case**: F01 / F01-H1
- **Screen**: S06 (Custom Video Player)
- **Build**: 1.0.0-rc1  Browser / device: Chrome 1440px
- **Steps**:
  1. Launch Video Player directly via URL `#/watch/t-002`.
  2. Click scrub bar before metadata loads (`duration` is NaN).
- **Expected**: Time display defaults cleanly to `0:00 / 0:00` until metadata loads.
- **Actual**: Displayed `0:00 / NaN:NaN`.
- **Evidence**: Initial console log observation.
- **Suspected cause**: `video.duration` is `NaN` until `loadedmetadata` event fires.
- **Status**: **Fixed** in `public/app.js` and `VideoPlayer.tsx` with `const dur = video.duration || 1;` and conditional duration formatting. Verified clean.

---

### BUG-003: Profile Limit Enforcement Boundary
- **Severity**: S2 (a feature broken, no workaround)
- **Flow / case**: F03 / F03-N1
- **Screen**: S03 (Manage Profiles)
- **Build**: 1.0.0-rc1  Browser / device: Chrome 1440px
- **Steps**:
  1. Have 5 profiles on account.
  2. Click "Add Profile" tile and submit a 6th profile name.
- **Expected**: Immediate rejection alert informing user that 5 is the maximum allowed limit.
- **Actual**: Request succeeded creating 6th profile, violating Netflix parity constraints.
- **Evidence**: `test/integration.test.js` and `test-runner.js` case `F03-N1`.
- **Suspected cause**: Missing count check in profile creation route handler.
- **Status**: **Fixed** in `lib/db.js` with `if (existing.length >= 5) throw new Error(...)` and PostgreSQL trigger `check_max_profiles_per_user`. Verified pass.

---

## QA Audit Summary

| Severity | Found | Open | Fixed |
| --- | --- | --- | --- |
| **S1** (Blocker / Data Loss / Security) | 0 | 0 | 0 |
| **S2** (Critical feature broken) | 1 | 0 | 1 |
| **S3** (Major / Functional flaw) | 1 | 0 | 1 |
| **S4** (Cosmetic / Minor) | 1 | 0 | 1 |
| **TOTAL** | **3** | **0** | **3** |

> **Gate Status**: **GREEN**. Zero open S1 or S2 bugs. Application is stable and ready for parity diff evaluation.
