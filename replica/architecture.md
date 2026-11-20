# Architecture: Netflix Web Clone (A rebuild of Netflix's core features)

Comprehensive technical architecture for rebuilding Netflix's core discovery, catalog browsing, video streaming player, multi-profile management, and personal watchlist.

## Stack

| layer | choice | why |
| --- | --- | --- |
| web app | Next.js 14+ (App Router) + TypeScript | High performance SSR for landing and SEO, React Server Components for fast catalog hydration, Client Components for interactive video player and hover cards. |
| styling | Tailwind CSS + Framer Motion + Lucide React | Official Netflix dark theme tokens (`#141414`), responsive multi-item carousels, and silky smooth hover card expansion animations. |
| database | PostgreSQL on Supabase / Neon | Relational integrity for episodes/seasons, JSONB metadata, full-text search (`tsvector` + `pg_trgm`), and robust Row-Level Security. |
| ORM | Drizzle ORM | Zero cold-start latency, fully type-safe SQL queries, and lightweight schema migrations. |
| auth | Supabase Auth (or Auth.js / NextAuth) | Secure HTTP-only cookie sessions with built-in multi-profile context scoping. |
| media storage | Cloudflare R2 / Supabase Storage | Low-cost video asset and thumbnail hosting with full HTTP 206 Partial Content (Byte-Range) streaming support. |
| payments | Stripe Checkout & Customer Portal | Standard tier subscription management (Basic, Standard, Premium) with automated webhooks. |
| email | Resend | Transactional welcome emails, password reset links, and new profile notifications. |
| jobs | Vercel Cron | Nightly cleanup of orphaned watch history and syncing trending metrics. |
| hosting | Vercel | Seamless edge middleware for profile redirection, serverless route handlers, and global edge caching for public assets. |

## Schema

Tables: **10**. Access rules: **PostgreSQL Row Level Security (RLS)** with foreign-key cascade deletions and check constraints.

Full DDL with indexes and security policies is defined in [schema.sql](file:///home/yahia/newProject/replica/schema.sql).

### Summary of Tables:
1. `users`: Account identity, email, hashed credentials, subscription plan tier, and Stripe customer mapping.
2. `profiles`: Up to 5 viewer profiles per account, avatar URL, kids-mode boolean, and autoplay settings. Enforced via database trigger `check_max_profiles_per_user`.
3. `genres`: Classification categories (Action, Comedy, Sci-Fi, Drama, Documentaries).
4. `titles`: Movies and TV series catalog with maturity ratings, duration/seasons, backdrop/thumbnail assets, stream URLs, and generated `tsvector` for search.
5. `title_genres`: Many-to-many relationship mapping titles to multiple genres.
6. `seasons`: Episodic season grouping for TV series with season ordering constraints.
7. `episodes`: Individual TV episodes with duration, video streaming URL, and exact millisecond/second cue points for `intro_start`, `intro_end`, and `credits_start`.
8. `watch_histories`: Real-time playback position (`progress_seconds`, `completed`) keyed per profile and title/episode for the "Continue Watching" row.
9. `watchlists`: User's "My List" saved items per profile with unique composite index.
10. `ratings`: Reaction tracking per profile (thumbs down, thumbs up, double thumbs up).

---

## API & Server Actions

Organized by user flows from `recon.md`.

### F01: Core Loop (Browse, Preview & Play)

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| `GET /api/catalog/browse` | Fetch curated rows (Trending, Top 10, Continue Watching, Genres) | Authenticated Profile | `{ profileId }` (query) | `{ billboard: Title, rows: CategoryRow[] }` | F01 |
| `GET /api/titles/:id` | Fetch full title details modal, cast, genres, seasons | Authenticated Profile | `titleId` (param) | `{ title: TitleDetail, seasons: Season[], similar: Title[] }` | F01 |
| `GET /api/titles/:id/episodes` | Fetch episode list for a specific season | Authenticated Profile | `titleId` (param), `{ seasonNumber }` (query) | `{ episodes: Episode[] }` | F01 |
| `GET /api/watch/:id` | Fetch video stream manifest, subtitles, and skip cue points | Authenticated Profile | `titleId` or `episodeId` | `{ streamUrl, cuePoints: { intro, credits }, nextEpisodeId }` | F01 |

### F02: Instant Search

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| `GET /api/search` | Full-text title, genre, and cast search | Authenticated Profile | `{ q: string }` (query) | `{ results: TitleCard[], relatedTags: string[] }` | F02 |

### F03: Profile Switching & Management

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| `GET /api/profiles` | List all profiles for the logged-in user | Authenticated User | None (reads session) | `{ profiles: Profile[] }` | F03 |
| `POST /api/profiles` | Create a new profile (max 5 enforced) | Authenticated User | `{ name: string, avatarUrl: string, isKid: boolean }` | `{ profile: Profile }` | F03 |
| `PATCH /api/profiles/:id` | Update profile details (name, avatar, autoplay) | Authenticated User | `{ name?, avatarUrl?, isKid?, autoplayNext? }` | `{ profile: Profile }` | F03 |
| `DELETE /api/profiles/:id` | Delete profile and all linked history/lists | Authenticated User | `profileId` (param) | `{ success: boolean }` | F03 |
| `POST /api/profiles/:id/select` | Set active profile cookie session | Authenticated User | `profileId` (param) | `{ activeProfileId: string }` | F03 |

### F04: Watchlist (My List) & Ratings

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| `GET /api/my-list` | Fetch active profile's saved titles | Authenticated Profile | None (reads active profile) | `{ items: TitleCard[] }` | F04 |
| `POST /api/my-list` | Add title to My List | Authenticated Profile | `{ titleId: string }` | `{ success: boolean }` | F04 |
| `DELETE /api/my-list/:titleId` | Remove title from My List | Authenticated Profile | `titleId` (param) | `{ success: boolean }` | F04 |
| `POST /api/ratings` | Submit thumb rating (dislike, like, love) | Authenticated Profile | `{ titleId: string, rating: string }` | `{ rating: string }` | F04 |
| `DELETE /api/ratings/:titleId` | Remove title rating | Authenticated Profile | `titleId` (param) | `{ success: boolean }` | F04 |

### F05 & F06: Continuous Playback & Watch History Sync

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| `POST /api/watch-history` | Heartbeat progress sync (called every 10s or on pause/exit) | Authenticated Profile | `{ titleId, episodeId?, progressSeconds, durationSeconds }` | `{ saved: boolean }` | F06 |
| `GET /api/continue-watching` | Fetch titles with progress < 95% | Authenticated Profile | None (reads active profile) | `{ inProgress: ContinueWatchingItem[] }` | F06 |
| `GET /api/episodes/:id/next` | Retrieve next chronological episode for autoplay | Authenticated Profile | `episodeId` (param) | `{ nextEpisode: Episode | null }` | F05 |

### Account & Webhooks
- **Webhooks In**:
  - `POST /api/webhooks/stripe`: Handles `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.
- **Background Jobs**:
  - `job_trending_refresh`: Vercel Cron running daily at 02:00 UTC to recompute title popularity scores.
  - `job_history_prune`: Vercel Cron running weekly to clean up stale watch entries older than 180 days.

---

## The Parts That Bite

- **Byte-Range Requests (HTTP 206) for Video Scrubbing**: HTML5 `<video>` scrubbing requires the media server (Cloudflare R2 / Supabase Storage) to return `Accept-Ranges: bytes` headers. Without this, users cannot jump to specific timestamps and scrub preview frames will fail.
- **Heartbeat Throttling & Beacon on Page Exit**: Sending watch history updates every second would flood the database. We debounce heartbeats to every 10 seconds during playback and utilize `navigator.sendBeacon` upon unmounting or closing the tab so the final progress is never lost.
- **Profile Context Leakage**: Users have multiple profiles under one login. All database queries for history, watchlist, and ratings must strictly validate both `user_id = auth.uid()` AND `profile.user_id = auth.uid()`. Active profile selection is stored in a secure signed HTTP cookie.
- **Auto-Play Next Episode Race Conditions**: Synchronizing the 5-second countdown timer, user manual clicks, and media loading without causing audio overlapping, duplicate network requests, or stale state.
- **Full-Text Search Typo Tolerance**: Using `pg_trgm` combined with GIN indexes ensures that searches like `"stranger thngs"` still match `"Stranger Things"`.

---

## Build Order

### 1. Vertical Slice (Core Loop End-to-End)
- **Screens**: S02 (Login), S04 (Browse with Billboard & 1 Row), S06 (Video Player).
- **Tables**: `users`, `profiles`, `titles`.
- **Routes**: `POST /api/auth/login`, `GET /api/catalog/browse`, `GET /api/watch/:id`.
- **Goal**: User can authenticate, view the catalog billboard, click play, and stream a video in the custom player.

### 2. Must-Haves
- **Screens**: S01 (Landing Page with FAQ), S03 (Profile Selection), S05 (Details Modal), S07 (Instant Search), S08 (Genre Filter), S09 (My List).
- **Tables**: `genres`, `title_genres`, `seasons`, `episodes`, `watchlists`, `watch_histories`.
- **Routes**: Full CRUD for profiles, search API, watchlist API, and watch history heartbeats.
- **Features**: Auto-hide Navbar, horizontal slider carousel, Skip Intro button, Continue Watching row.

### 3. Should-Haves & Polish
- **Screens**: S10 (Account Settings), Card Hover Preview with video teaser.
- **Tables**: `ratings`.
- **Routes**: Rating endpoints, next episode recommendation API, Stripe subscription webhooks.
- **Features**: 5-second countdown to next episode, scrub bar hover time tooltips, Kids profile content filters.

### 4. Fixes & Positioning Enhancements
- Post-launch optimizations derived from user feedback and usability audits.
