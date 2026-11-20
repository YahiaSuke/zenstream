# Launch Execution Plan: ZenStream

Go-to-market rollout roadmap, community distribution strategy, and early user acquisition plan.

---

## 1. Pre-Launch Beta & Waitlist (Week -2 to 0)

- **Target Audience**: 200 early beta viewers from film enthusiasts, remote workers, and audio-conscious streamers.
- **Landing Page Deployment**: Live on `zenstream.app` with simple email capture for early access invitations.
- **Instrumentation**:
  - Privacy-friendly analytics (Plausible / PostHog) to monitor funnel drop-off on `/` -> `/browse` -> `/watch`.
  - Sentry error monitoring active to catch any playback edge-case errors across browsers.

---

## 2. Community Distribution (Targeting Unhappy Users Where They Vent)

Instead of generic advertising, engage directly where users voiced intense frustration:

### A. Hacker News ("Show HN")
- **Headline**: *Show HN: ZenStream – A streaming platform that lets the credits roll and never autoplays previews*
- **Hook**: Focus on the engineering and product decisions: why we built a custom HTML5 player with Web Audio dialogue normalization, zero uninvited video autoplay, and no household geofencing.
- **Tone**: Technical, candid, open-source friendly.

### B. Reddit Outreach (r/netflix, r/television, r/movies)
- **Target Discussions**: Threads discussing autoplay anxiety, loud audio mixing, and 5-second credit countdowns.
- **Contribution**: Share the story of building an alternative focused strictly on user respect:
  - *"We were so exhausted by streaming apps cutting off end credits and screaming trailers that we built a peaceful alternative."*
- **Policy**: Strictly organic and transparent; no spamming or sock-puppet accounts.

### C. Product Hunt Launch
- **Tagline**: *Cinema without the noise – calm streaming for film lovers.*
- **Lead Visuals**: Side-by-side demo:
  - Left: Aggressive countdown popup shrinking the screen over dramatic music.
  - Right: ZenStream letting the credits roll serenely until the viewer decides to advance.
- **Maker Comment**: Explain the core philosophy and highlight the 14-day free trial.

---

## 3. The First 10 User Interviews (Qualitative Feedback Loop)

Conduct 20-minute 1-on-1 walkthroughs with the first 10 subscribed users:
1. *What specific moment made you decide to sign up?*
2. *How did your evening browsing experience feel compared to other apps?*
3. *Did the Dialogue Clarity Normalizer help your listening experience?*
4. *What was the single most frustrating thing you encountered in our app?*
5. *If you could add one feature to ZenStream tomorrow, what would it be?*

---

## 4. Key Launch Success Metrics

| Metric | Target (Day 30) | Measurement |
| --- | :---: | --- |
| **Landing Page Conversion** | > 8.0% | Visitors clicking "Start Watching" |
| **Trial-to-Paid Conversion** | > 45.0% | Users completing 14-day trial without canceling |
| **Monthly Churn** | < 4.0% | Subscription cancellations via Customer Portal |
| **Feature Utilization** | > 60.0% | Viewers utilizing "Respect Credits" or "Hide Title" |
