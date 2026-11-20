# Test Plan: StreamFlow (Netflix Web Clone)

Build: 1.0.0-rc1  Date: 2026-11-20  Env: local dev server (port 3000), seed data

| case | flow | type | steps | expected | auto | result |
| --- | --- | --- | --- | --- | --- | --- |
| F01-H1 | F01 Browse to Play | happy | Open `#/browse`, click title card, open details modal, click "Play" | Modal renders with metadata, player opens in full viewport with video stream and transport bar | e2e | pass |
| F01-E1 | F01 Browse to Play | edge: mobile width | View at 390px viewport | Navbar collapses, cards scroll smoothly 2-up, modal stacks synopsis and cast vertically | e2e | pass |
| F01-E2 | F01 Browse to Play | edge: keyboard only | Tab navigate to billboard "Play" and press Enter | Focus ring visible, player launches without mouse input | e2e | pass |
| F01-N1 | F01 Browse to Play | negative: invalid title | Navigate directly to `#/watch/invalid-id-999` | Graceful error alert or fallback without throwing uncaught exceptions | e2e | pass |
| F02-H1 | F02 Instant Search | happy | Click search bar, type "Neon", view results grid | "Neon Vanguard" card appears in grid with match score and rating | e2e | pass |
| F02-E1 | F02 Instant Search | edge: special characters | Search for `<script>alert('x')</script>` or emoji 🚀 | Input safely escaped, no XSS vulnerability, results render cleanly | e2e | pass |
| F02-N1 | F02 Instant Search | negative: no matches | Search for "xyznonexistent999" | Displays "did not find any matches" message with suggested keyword tips | e2e | pass |
| F03-H1 | F03 Profile Switch | happy | Open `#/profiles`, select "Kids Club" | Active profile updates, catalog reloads filtered to kids-rated content (ALL / 7+) | e2e | pass |
| F03-H2 | F03 Profile Creation | happy | Click "Add Profile", enter name "Guest", submit | Profile added, total count increments to 4, profile selectable | e2e | pass |
| F03-E1 | F03 Profile Creation | edge: long name (30 chars)| Enter 30 character profile name | Accepted and truncated with ellipsis in UI without layout breakage | e2e | pass |
| F03-N1 | F03 Profile Limit | negative: 6th profile | Attempt to create 6th profile on account | Database trigger/API returns 400 error: "Maximum 5 profiles allowed per account" | e2e | pass |
| F04-H1 | F04 Watchlist Add | happy | In details modal, click "＋" button | Icon updates to "✓", title appears immediately in `#/browse/my-list` | e2e | pass |
| F04-H2 | F04 Watchlist Remove | happy | In My List, click remove on saved title | Card vanishes with optimistic UI update, DB reflects removal | e2e | pass |
| F04-E1 | F04 Watchlist Empty | edge: zero items | Clear all items from My List | Informative empty state displayed guiding user to browse catalog | e2e | pass |
| F04-N1 | F04 Watchlist Idempotent | negative: double click add | Double-click add button rapidly | Single entry created in watchlist without duplicate key violations | e2e | pass |
| F05-H1 | F05 Next Episode | happy | Watch episode to credits timestamp | "Next Episode" prompt appears, advances stream to Episode 2 | e2e | pass |
| F05-E1 | F05 Skip Intro | edge: cue point timing | Video playback reaches 10s | "Skip Intro" button appears at 10s and clicking jumps directly to 25s | e2e | pass |
| F06-H1 | F06 Continue Watching | happy | Watch video to 45%, exit to `#/browse` | Title appears in "Continue Watching" row with 45% red progress bar | e2e | pass |
| F06-E1 | F06 Completed Title | edge: watch past 95% | Watch video to 96% progress | Automatically marked completed and removed from Continue Watching queue | e2e | pass |
| F06-E2 | F06 Heartbeat Throttle | edge: rapid playback | Play video continuously | Heartbeat progress calls throttled to at most once every 10s | e2e | pass |
