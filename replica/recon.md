# Recon map: Netflix (Web)

Scope: Core video streaming discovery, catalog browsing, custom media player, multi-profile management, and personal watchlist
For: Modern video streaming web platform / portfolio / niche video on demand (VOD) service
Date: 2026-11-20

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Netflix Help Center | https://help.netflix.com/ | Feature specifications, profile settings, player shortcut controls, maturity ratings |
| 2 | Netflix Public Web App | https://www.netflix.com/ | Landing page, browse UI patterns, navigation structure, card interactions |
| 3 | Netflix TechBlog | https://netflixtechblog.com/ | UI architecture, video player state machine, recommendation carousel design |
| 4 | TMDB (The Movie Database) API | https://developer.themoviedb.org/ | Industry-standard metadata structure for movies, TV series, genres, cast, and posters |
| 5 | Blender Open Projects & Creative Commons Media | https://studio.blender.org/films/ | High-quality open video assets with subtitles for video player streaming simulation |

## Core loop

Discover curated movies and TV shows across category carousels, preview details and trailers, seamlessly stream high-definition video with playback tracking, and curate a personalized watch list.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Landing Page | `/` (unauthenticated) | Marketing showcase, email onboarding, FAQ accordion | Hero header, Language switcher, Email capture CTA, Feature cards, FAQ accordion, Footer | default, email invalid error, mobile viewport |
| S02 | Authentication | `/login`, `/signup` | User sign-in and account registration | Auth card, floating label inputs, Remember Me checkbox, Submit button, Error alerts | empty, loading/submitting, invalid credentials error, success |
| S03 | Profile Gate & Management | `/profiles`, `/manage-profiles` | Multi-user profile selection and creation | Profile avatar grid, Add profile tile, Manage button, Profile edit modal (avatar, name, kids toggle) | default list, edit mode, add modal, max 5 profiles reached |
| S04 | Browse Home | `/browse` | Primary discovery dashboard and video feed | Navbar with auto-hide/solid background, Billboard hero trailer, Category carousels, Card hover preview | loading skeleton, filled, hovered card preview, empty continue-watching |
| S05 | Title Details Modal | Modal over `/browse?title=:id` | Comprehensive movie/series metadata and episodes | Backdrop teaser, Play/Add/Rate buttons, Match score, Synopsis, Season dropdown, Episode list, More Like This grid | loading, video trailer playing, season switching, error |
| S06 | Custom Video Player | `/watch/:id` | Full-screen immersive streaming experience | Transport controls, Scrub bar with timestamp preview, 10s skip buttons, Audio/Subtitles drawer, Speed picker, Skip Intro button, Next Episode countdown | buffering spinner, controls visible, controls hidden on idle, episode transition |
| S07 | Instant Search | `/search?q=:query` | Live content filtering by title, actor, or genre | Search bar input, Results grid, Related tag pills, No results recommendation state | typing/debouncing, results populated, empty / no results |
| S08 | Genre & Format Catalog | `/browse/genre/:id`, `/browse/movies`, `/browse/tv-shows` | Filtered browsing for movies or TV series | Genre header, Sub-genre dropdown filter, Sort selector (Suggested, Year, A-Z), Carousel/Grid toggle | loading, filtered results, empty category |
| S09 | My List (Watchlist) | `/browse/my-list` | Personal saved titles queue | Title card grid, Quick remove button, Filter pills (All, Movies, TV Series) | empty state, populated grid, item removed toast |
| S10 | Account & Settings | `/your-account` | Membership overview, profile settings, and watch history | Subscription overview card, Profiles list, Viewing activity log with hide option, Playback settings | default, settings updated toast, confirm dialog |

## Flows

```
F01 Core Streaming Loop (Browse to Play)
    S04 (Browse Home) -> Hover Title Card -> S05 (Details Modal) -> Click "Play" -> S06 (Custom Video Player)
    happy path clicks: 2
    edge: Video network timeout, resume from saved timestamp, maturity pin required

F02 Instant Search to Watch
    S04 (Browse Home) -> Click Search Icon in Navbar -> Type Query -> S07 (Search Grid) -> Click Title Card -> S06 (Video Player)
    happy path clicks: 2 (plus typing query)
    edge: No matches found -> displays recommended titles

F03 Profile Switch & Onboarding
    S04 (Browse) -> Click Profile Menu -> S03 (Profile Selection) -> Select Profile (e.g., Kids) -> S04 (Reloads with filtered Kids catalog & dedicated My List)
    happy path clicks: 2
    edge: Creating 6th profile blocked (limit 5 profiles per account)

F04 Watchlist Management (Add/Remove My List)
    S04 (Browse) or S05 (Details Modal) -> Click "+" Button -> State toggles to Checkmark -> Navigate to S09 (My List) -> Title visible -> Click remove
    happy path clicks: 2
    edge: Optimistic UI update with rollback if API fails

F05 Episodic Continuous Playback (Next Episode)
    S06 (Video Player watching TV episode) -> Video reaches credit timestamp -> "Next Episode" prompt with 5s countdown -> Auto-plays next episode or user clicks "Play Next" -> S06 updates stream and title
    happy path clicks: 0 (automatic) or 1 (instant skip)
    edge: Last episode of the season reached -> suggest "More Like This" titles

F06 Resume Playback via Continue Watching
    S06 (User exits video at 14m:30s) -> S04 (Browse displays title in "Continue Watching" row with progress indicator at 45%) -> User clicks card -> S06 opens immediately at 14m:30s
    happy path clicks: 1
    edge: Video was >95% watched -> marked as completed, removed from Continue Watching
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Navbar | transparent, solid black, minimal | default, scrolled, search open, profile dropdown open | S01, S04, S07, S08, S09, S10 |
| BillboardHero | standard with trailer, static poster | loading, trailer playing, muted, unmuted | S04, S08 |
| ContentCarousel | horizontal slider, top-10 ranked slider | idle, hovering card, sliding left/right, end-of-list | S04, S08 |
| TitleCard | standard poster, landscape card, top-10 numbered | default, hover preview expanded, progress bar active | S04, S07, S08, S09 |
| HoverPreviewCard | floating overlay with mini video player | loading, trailer playback, action buttons hover | S04, S08 |
| DetailsModal | movie details, tv series with episodes | open, season selected, episode hovered, closing | S04, S05, S07, S08, S09 |
| VideoPlayer | full-screen overlay, windowed | buffering, playing, paused, idle (controls hidden), scrubbing | S06 |
| PlayerControls | bottom transport bar, top navigation bar | visible, hidden, slider drag, menu open | S06 |
| SkipButton | "Skip Intro", "Skip Recap", "Next Episode" | appearing, hovered, active, auto-dismiss | S06 |
| EpisodeAccordion | list item with thumbnail, title, synopsis | default, active/playing, hovered | S05 |
| ProfileAvatar | rounded square with vibrant avatar, add profile button | default, hovered, edit badge visible, active | S03, S04, S10 |
| Button | primary (white), secondary (translucent gray), circle icon, danger (red) | default, hover, active, disabled, loading | all |
| Input | floating label dark input, search input | default, focused, filled, error, disabled | S01, S02, S03, S07 |
| Accordion | FAQ question/answer toggle | collapsed, expanded | S01 |

## Inferred data model

```
User
    id (uuid, pk)
    email (varchar, unique)
    password_hash (varchar)
    plan_tier (enum: basic, standard, premium)
    created_at (timestamp)
    updated_at (timestamp)
    evidence: S01 pricing, S02 login, S10 account settings
    confidence: high

Profile
    id (uuid, pk)
    user_id (uuid, fk -> User.id)
    name (varchar)
    avatar_url (varchar)
    is_kid (boolean)
    language (varchar, default 'en')
    autoplay_next (boolean, default true)
    autoplay_previews (boolean, default true)
    created_at (timestamp)
    evidence: S03 manage profiles, Netflix Help Center profile guidelines
    confidence: high

Title
    id (uuid, pk)
    title (varchar)
    slug (varchar, unique)
    type (enum: movie, series)
    synopsis (text)
    release_year (integer)
    maturity_rating (varchar) -- G, PG, PG-13, TV-MA, R
    duration_minutes (integer, nullable) -- for movies
    total_seasons (integer, nullable) -- for series
    thumbnail_url (varchar)
    backdrop_url (varchar)
    trailer_url (varchar, nullable)
    video_url (varchar, nullable) -- for movies
    match_score (integer) -- e.g. 98%
    is_featured (boolean, default false)
    created_at (timestamp)
    evidence: S04 billboard, S05 details modal, TMDB schema standard
    confidence: high

Genre
    id (uuid, pk)
    name (varchar, unique)
    slug (varchar, unique)
    evidence: S08 genre browse, S04 row categories
    confidence: high

TitleGenre
    title_id (uuid, fk -> Title.id)
    genre_id (uuid, fk -> Genre.id)
    pk(title_id, genre_id)
    evidence: Titles belong to multiple genres (Action, Sci-Fi)
    confidence: high

Season
    id (uuid, pk)
    series_id (uuid, fk -> Title.id)
    season_number (integer)
    title (varchar)
    synopsis (text, nullable)
    evidence: S05 season selector dropdown
    confidence: high

Episode
    id (uuid, pk)
    season_id (uuid, fk -> Season.id)
    episode_number (integer)
    title (varchar)
    synopsis (text)
    duration_minutes (integer)
    thumbnail_url (varchar)
    video_url (varchar)
    intro_start_seconds (integer, nullable)
    intro_end_seconds (integer, nullable)
    credits_start_seconds (integer, nullable)
    evidence: S05 episode list, S06 skip intro and next episode triggers
    confidence: high

WatchHistory
    id (uuid, pk)
    profile_id (uuid, fk -> Profile.id)
    title_id (uuid, fk -> Title.id)
    episode_id (uuid, fk -> Episode.id, nullable)
    progress_seconds (integer)
    duration_seconds (integer)
    completed (boolean, default false)
    last_watched_at (timestamp)
    evidence: S04 Continue Watching row, S06 resume playback, S10 viewing history
    confidence: high

Watchlist (My List)
    id (uuid, pk)
    profile_id (uuid, fk -> Profile.id)
    title_id (uuid, fk -> Title.id)
    added_at (timestamp)
    unique(profile_id, title_id)
    evidence: S09 My List grid, S04/S05 Add to list button
    confidence: high

Rating
    id (uuid, pk)
    profile_id (uuid, fk -> Profile.id)
    title_id (uuid, fk -> Title.id)
    rating (enum: dislike, like, love)
    updated_at (timestamp)
    evidence: S04/S05 Thumbs buttons
    confidence: high
```

Relationships:
- User (1) -> (n) Profile [up to 5]
- Profile (1) -> (n) WatchHistory
- Profile (1) -> (n) Watchlist
- Profile (1) -> (n) Rating
- Title (1) -> (n) TitleGenre <- (n) Genre
- Title (1) -> (n) Season -> (n) Episode
- Title (1) -> (n) WatchHistory
- Title (1) -> (n) Watchlist

## Feature matrix

See `features.csv`. Must: 11, should: 9, could: 6, skip: 3. Total: 29.

## Out of scope (cannot or should not be cloned)

- **Hollywood studio DRM-protected content library (Widevine L1 / PlayReady / FairPlay)**: A web clone cannot license commercial copyrighted films (Netflix Originals, Disney, Sony, Warner). Instead, the clone uses open-source 4K/HD streaming media (Blender Open Projects: Tears of Steel, Big Buck Bunny, Cosmos Laundromat, Sintel) alongside real TMDB metadata.
- **Global Open Connect Appliance CDN**: Netflix's physical ISP-embedded caching hardware appliances cannot be replicated. Replaced with standard modern cloud object storage (S3/R2/Cloudflare CDN) with HLS/MP4 adaptive streaming.
- **Native OS encrypted offline download container**: DRM hardware-level mobile/desktop offline encrypted storage is native-only and out of scope for a clean web clone.
- **Telecom carrier billing partnerships**: Specialized mobile carrier direct billing integrations.

## Size

Screens: 10, flows: 6, entities: 9.
Hard parts:
1. Custom HTML5 video player with state machine (idle control fading, scrub bar timestamp previews, Skip Intro timestamps, and auto-play next episode countdown).
2. Netflix-style UI interactions (dynamic transparent-to-black navbar on scroll, horizontal multi-item slider with page slide animations, expandable hover preview card with micro-teaser).
3. Continue Watching synchronization (resuming exact timestamps across profiles, dynamic watch progress tracking).

Size: **M (a few weeks)**.
