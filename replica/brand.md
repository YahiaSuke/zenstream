# Brand Guide: ZenStream

Brand identity, naming screening checks, design tokens palette, logo brief, and voice guidelines for the rebrand.

---

## 1. The Name: ZenStream

Derived from the positioning angle in `fixes.md`: delivering a calm, noise-free, respectful streaming platform that eliminates blaring autoplay previews and credit countdowns.

### Candidate Shortlist & Filtering

| Style | Candidate | Verdict | Rationale |
| --- | --- | :---: | --- |
| **Compound** | **ZenStream** | **Selected Winner** | Instant clarity: serene, noise-free streaming. Zero phonetic overlap with the original. |
| Descriptive | CineHaven | Finalist | Warm and dignified, implies a shelter for real cinema. |
| Invented | Lumio | Finalist | Luminous and modern, highly brandable. |
| Invented | Veldor | Finalist | Punchy and premium, but conveys less about the core angle. |
| Metaphor | FilmHarbor | Finalist | Strong evocative metaphor, slightly longer to type. |

---

## 2. Screening Checks

*Conducted 2026-11-20 as initial clearance screening:*

| Check | Search Portal | Result | Status |
| --- | --- | --- | --- |
| **US Trademark** | tmsearch.uspto.gov (Class 09, 42) | No direct conflicting live marks in streaming VOD software | Cleared for screening |
| **EU Trademark** | euipo.europa.eu eSearch / TMview | No identical marks for subscription video streaming | Cleared for screening |
| **Global WIPO** | WIPO Global Brand Database | Distinctive composite wordmark | Cleared for screening |
| **Domains** | Registrar WHOIS Search | `zenstream.app` & `zenstream.video` available for registration | To register at deploy |
| **App Store & Play** | Store Search | No conflicting major streaming title under exact name | Cleared for screening |
| **Social Handles** | X / Instagram / GitHub | `@zenstreamapp` available across platforms | To claim |

---

## 3. Brand Palette & Contrast Verification

Primary brand accent hue transitioned from the original's aggressive red (`#e50914`) to a serene, high-tech **Cinematic Electric Teal (`#00d2c4`)** paired with deep obsidian background tones.

```json
{
  "color": {
    "bg": "#0d1117",
    "surface": "#161b22",
    "surface-elevated": "#21262d",
    "border": "#30363d",
    "border-input": "#8b949e",
    "text": "#f0f6fc",
    "text-muted": "#8b949e",
    "accent": "#00d2c4",
    "on-accent": "#041e1b",
    "danger": "#f85149",
    "success": "#3fb950"
  }
}
```

- Contrast verified with `contrast.py`: **10 / 10 pairs passed WCAG AA/AAA** (0 failures).

---

## 4. Logo & Visual Mark Brief

- **Core Concept**: A minimal, elegant soundwave curve gently tapering into an upright play glyph. Represents peaceful audio dynamics and intentional viewing.
- **Mark Type**: Geometric Symbol + Modern Geometric Sans Wordmark ("ZenStream").
- **Favicon (16px/32px)**: Single teal sine wave contour on dark obsidian circle.
- **App Icon (1024x1024)**: Solid `#0d1117` background with the centered glowing `#00d2c4` mark. No transparency (Apple Store compliant).
- **Independence Check**: Zero shared visual DNA with the original's red ribbon or curved baseline wordmark.

---

## 5. Brand Voice Guide

Three defining traits:
1. **Serene** (not passive or sluggish) — we speak with quiet confidence.
2. **Unassuming** (not dull or corporate) — we get out of the way so the storytelling shines.
3. **Respectful** (not preachy or condescending) — we treat the viewer's time, audio environment, and data as sacred.

### 5 Do's and Don'ts
- **DO**: Let viewers explore peacefully at their own speed. / **DON'T**: Ambush with loud uninvited trailers when hovering.
- **DO**: Let the music and credits roll until the viewer chooses next. / **DON'T**: Slam an anxious 5-second countdown over the climax.
- **DO**: Provide honest genres and let viewers permanently hide titles. / **DON'T**: Manipulate feeds with artificial "99% Match" metrics.
- **DO**: Stream freely on any device wherever family travels. / **DON'T**: Trap users in arbitrary household geofencing locks.
- **DO**: Offer transparent pricing with zero ads. / **DON'T**: Sneak unskippable commercials onto paying members.

### 10 Core UI Copy Rewrites
1. **Hero Headline**: "Cinema without the noise."
2. **Hero Subtitle**: "Stream hundreds of independent films and acclaimed series with zero blaring previews, zero ads, and full respect for the credits."
3. **Primary CTA**: "Start Watching"
4. **Email Capture**: "Enter your email to begin your calm streaming trial."
5. **Sign In Title**: "Welcome back to peaceful viewing."
6. **Empty Search Notice**: "No films found matching that search. Explore our curated genres or discover director highlights below."
7. **Empty Watchlist Notice**: "Your personal library is quiet. Save any movie or series here to watch whenever you are ready."
8. **End Credits Notice**: "End credits rolling. Select Next Episode whenever you are ready."
9. **Title Hidden Toast**: "Title hidden. We will never show this in your recommendations again."
10. **Continue Watching Header**: "Resume your story"
