# Component Specifications: Netflix Web Clone

Design system specification for all UI primitives and composite components identified during recon. Built on accessible web standards with semantic HTML, keyboard navigation, and WCAG AA compliance.

---

## Primitives

### Button
```yaml
Component: Button
Variants:
  - primary: Solid white background with black text (Iconic Netflix Play CTA)
  - secondary: Semi-transparent gray background with white text (More Info CTA)
  - accent: Solid crimson background with white text (Get Started, Sign In CTA)
  - ghost: Transparent with hover surface fill
  - icon: Circular action button with border (Add to My List, Like/Dislike, Volume Mute)
  - danger: Subtle red background with danger text
Sizes:
  - sm: height 32px, px 12px, font-xs, icon 16px
  - md: height 40px, px 18px, font-sm, icon 20px
  - lg: height 48px, px 24px, font-md, icon 24px
States:
  - default: Base opacity 1
  - hover: 10% brightness shift, scale 1.02 on primary
  - active: scale 0.98
  - focus-visible: 2px solid white outline, 2px offset
  - disabled: opacity 50%, cursor not-allowed, pointer-events none
  - loading: Spinner replacing icon or beside label, aria-busy="true"
Tokens:
  - primary: bg #ffffff, text #141414, radius-sm, font-weight 600
  - secondary: bg rgba(109,109,110,0.7), text #ffffff, radius-sm, font-weight 600
  - accent: bg accent, text on-accent, radius-sm, font-weight 600
  - icon: bg rgba(42,42,42,0.6), border 2px #737373, text #ffffff, radius-pill
a11y: Semantic <button>, visible keyboard focus indicator, aria-label on icon-only buttons
Used on: All screens (S01 - S10)
```

### Input
```yaml
Component: Input
Variants:
  - floating: Floating label inside dark input (used on login, signup, landing)
  - search: Inline search input expanding on icon click with clear button
Sizes:
  - md: height 48px, px 16px, font-sm
  - lg: height 56px, px 20px, font-base
States:
  - default: bg surface, border border, text #ffffff
  - focused: border border-input, label floats to top-2 font-xs text-muted
  - filled: Label stays floated, value legible
  - error: border danger, aria-invalid="true", error message in text-danger
  - disabled: opacity 40%, cursor not-allowed
Tokens:
  - bg: surface (#1f1f1f), border: #333333, text: #ffffff, radius: radius-sm
a11y: Linked <label htmlFor="...">, aria-describedby for validation error messages
Used on: S01, S02, S03, S07
```

### Badge & Pill
```yaml
Component: Badge
Variants:
  - age-rating: Bordered box for maturity rating (e.g., '16+', 'TV-MA', 'PG-13')
  - quality: Ultra HD 4K, HDR, Spatial Audio, CC pills
  - top10: Red ribbon badge with ranking number
Tokens:
  - border: border-input, text: text-muted, radius: radius-sm, font: font-xs/bold
Used on: S04, S05, S06
```

---

## Composite Components

### Navbar
```yaml
Component: Navbar
Variants:
  - transparent: Clear gradient over billboard backdrop
  - solid: Black (#141414) background transitioning after 20px scroll
Elements:
  - Brand Logo (clickable -> /browse)
  - Navigation links: Home, TV Shows, Movies, New & Popular, My List
  - Secondary utilities: Expandable Search, Notification Bell, Profile Avatar menu
States:
  - initial: transparent
  - scrolled: bg-bg opacity-100 transition 300ms ease
  - mobile: Hamburger menu drawer
a11y: <nav aria-label="Main Navigation">, role="menubar", aria-expanded on profile menu
Used on: S01, S04, S07, S08, S09, S10
```

### BillboardHero
```yaml
Component: BillboardHero
Elements:
  - Background: Full-bleed backdrop image or muted autoplaying video trailer
  - Vignette gradient overlays (bottom fade to #141414 and left dark shade)
  - Title typography / graphic logo
  - Synopsis description paragraph (max 3 lines clamp)
  - Action button group: "Play" (primary button) + "More Info" (secondary button)
  - Audio toggle button (Mute / Unmute icon)
  - Maturity rating pill badge with right align anchor
States:
  - loading: Dark skeleton pulse
  - idle: High-res poster backdrop
  - trailer-active: Video playing, audio muted by default
Used on: S04, S08
```

### ContentCarousel (Row Slider)
```yaml
Component: ContentCarousel
Elements:
  - Category header label (e.g. "Trending Now", "Continue Watching")
  - Horizontal card container with CSS snap / transform slider
  - Left & Right pagination chevrons (appear on hover over carousel track)
  - Progress indicator dots (multi-page indicator)
States:
  - idle: Chevrons invisible
  - row-hovered: Chevrons fade in with semi-transparent black backing
  - sliding: CSS transform translateX with cubic-bezier transition (base 250ms)
  - start-edge: Left chevron hidden
  - end-edge: Right chevron loops or disappears
a11y: role="region" aria-label="[Category Title] Carousel", ArrowLeft / ArrowRight keyboard navigation
Used on: S04, S08
```

### TitleCard & HoverPreviewCard
```yaml
Component: TitleCard
Elements:
  - 16:9 landscape poster thumbnail (or 2:3 vertical poster for Top 10)
  - In-progress bar at bottom edge (for Continue Watching row)
  - Match score and episode number overlay
States:
  - default: Clean card with rounded corners
  - hovered: Delays 400ms, then triggers HoverPreviewCard
Used on: S04, S07, S08, S09

Component: HoverPreviewCard
Elements:
  - Popover scale animation (scale 1.35x, origin center or edge-aware)
  - Mini video trailer playback or animated GIF preview
  - Action buttons: Play (circle white), Add to List (circle icon), Thumb Up (circle icon), More Info Chevron (circle icon)
  - Metadata row: Match score (green #4ade80), Maturity rating pill, Duration/Seasons, HD badge
  - Genre bullet tags: e.g. "Gritty • Action • Sci-Fi"
Tokens:
  - bg: surface (#1f1f1f), shadow: shadow-pop, radius: radius-md
a11y: Escape key closes hover preview, focus trap inside card when navigated by keyboard
Used on: S04, S08
```

### DetailsModal
```yaml
Component: DetailsModal
Elements:
  - Modal backdrop overlay: rgba(0,0,0,0.7)
  - Header: Large 16:9 trailer player with gradient fade, Play & My List buttons
  - Close button: 'X' icon top-right (circle button)
  - Body split columns:
    - Left (70%): Match score, year, age rating, duration, audio description, synopsis text
    - Right (30%): Cast list, Genres, This title is: [tags]
  - TV Shows section: Season selector dropdown, Episode list accordion
  - Bottom section: "More Like This" 3-column recommendation grid
  - "About [Title]" credits section
States:
  - open: Fade in + scale up 0.95 -> 1.0 (200ms)
  - season-switching: Skeleton loader over episode list
  - closed: Fade out (150ms)
a11y: role="dialog" aria-modal="true", Focus trapped, Escape key closes modal
Used on: S04, S05, S07, S08, S09
```

### VideoPlayer
```yaml
Component: VideoPlayer
Elements:
  - HTML5 video container with full-bleed aspect ratio
  - Top navigation bar: Back button (arrow + title text)
  - Bottom controls overlay:
    - Play / Pause button
    - Rewind 10s / Fast-forward 10s buttons
    - Volume icon with horizontal slider bar
    - Current title / episode title label
    - Next Episode button
    - Episodes list drawer toggle button
    - Audio & Subtitles selector menu
    - Playback speed dropdown (0.5x, 0.75x, 1x, 1.25x, 1.5x)
    - Fullscreen toggle button
  - Scrub progress bar:
    - Background track, buffered buffer bar, played progress bar in red (#e50914)
    - Hover preview time badge
  - Dynamic overlay triggers:
    - "Skip Intro" button (bottom right, above controls)
    - "Next Episode in 5s..." post-credits modal with "Watch Now" button
States:
  - playing: Controls automatically fade out after 2.5s mouse inactivity
  - paused: Controls permanently visible
  - buffering: Centered red spinner
  - scrubbing: Progress track drags smoothly, showing preview timestamp
a11y: Keyboard shortcuts: Space/K (Play/Pause), M (Mute), F (Fullscreen), Left/Right (seek 10s), Up/Down (Volume)
Used on: S06
```

### ProfileAvatar
```yaml
Component: ProfileAvatar
Elements:
  - Rounded square avatar image (classic Netflix smiley avatar series)
  - Name label underneath
  - Edit icon overlay (in manage profiles mode)
Sizes:
  - sm: 32px (Navbar dropdown)
  - md: 80px (Manage profiles list)
  - lg: 120px (Profile selection screen)
States:
  - default: Clean avatar
  - hover: 2px solid white border, text brightness up
  - active: scale 0.95
Used on: S03, S04, S10
```
