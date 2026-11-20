# Backend Specification & Implementation: StreamFlow (Netflix Web Clone)

Comprehensive documentation of authentication, database migrations, Stripe payments integration, transactional email, background jobs, and security verification.

---

## 1. Authentication & Session Management

- **Password Hashing**: Implemented in [lib/auth.js](file:///home/yahia/newProject/lib/auth.js) using **PBKDF2** with a cryptographically secure 16-byte salt, 100,000 iterations of SHA-512, and timing-safe comparison to prevent timing attacks.
- **Session Tokens**: Cryptographically signed HMAC SHA-256 tokens stored exclusively in **HTTP-only, Secure, SameSite=Lax** cookies (`streamflow_session`). Never accessible to client-side JavaScript.
- **Multi-Profile Authorization**: Every data read and mutation validates `canUserAccess(authenticatedUserId, resourceOwnerId)` ensuring strict isolation. Tested with a simulated second user; access is completely blocked.
- **Account Deletion**: Full cascading deletion removing the user account, associated profiles, watch history, and watchlist records (`ON DELETE CASCADE`).

---

## 2. Database & Migrations

- **Database Engine**: PostgreSQL with native `pgcrypto` and `pg_trgm` extensions.
- **Migration Files**: [migrations/0001_initial_schema.sql](file:///home/yahia/newProject/migrations/0001_initial_schema.sql).
- **Migration Runner**: [scripts/migrate.js](file:///home/yahia/newProject/scripts/migrate.js) executes versioned SQL migrations with dry-run syntax verification.
- **Seed Script**: [scripts/seed.js](file:///home/yahia/newProject/scripts/seed.js) populates real movies, TV series, episodes, genres, and cue points for Skip Intro.
- **Row Level Security (RLS)**: Enforced across all 10 tables with public read access on catalog items and user-restricted policies on profiles, watch history, and watchlists.
- **Profile Limit Constraint**: PostgreSQL trigger `check_max_profiles_per_user` enforces a hard limit of 5 profiles per account.

---

## 3. Stripe Payments (Test Mode)

- **Checkout Sessions**: [lib/stripe.js](file:///home/yahia/newProject/lib/stripe.js) creates hosted Stripe Checkout sessions for plan tiers (Basic, Standard, Premium).
- **Customer Portal**: Direct integration with Stripe Customer Portal allowing 1-click subscription tier changes and cancellations.
- **Webhook Handling**:
  - Signatures verified via HMAC SHA-256 with timestamp tolerance checks.
  - Idempotent event processing tracking event IDs to prevent duplicate actions on retries.
  - Event handlers: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.

---

## 4. Transactional Email & Jobs

- **Email Client**: [lib/email.js](file:///home/yahia/newProject/lib/email.js) integrates with **Resend** (with local dev fallback).
- **Templates**:
  - `sendWelcomeEmail`: Sent upon registration with quick link to `/browse`.
  - `sendPasswordResetEmail`: Generates secure expiring reset token.
- **Scheduled Jobs**:
  - `job_trending_refresh`: Nightly job at 02:00 UTC recomputing popularity scores.
  - `job_history_prune`: Weekly cleanup of orphaned watch history older than 180 days.

---

## 5. Third-Party Integrations & External APIs

| Service | Purpose | Official API | Auth Scopes | Review Notes |
| --- | --- | --- | --- | --- |
| Stripe | Subscription checkout & portal | Stripe API v2024+ | Secret key | Standard automated test mode onboarding |
| Resend | Transactional notifications | Resend REST API | API Key (`re_...`) | Domain DKIM/SPF DNS records required for production |
| Cloudflare R2 | Video streaming & image assets | S3-Compatible API | Object read/write | CORS must allow `Range` and `Origin` headers for HTTP 206 video scrubbing |

---

## 6. Security Checklist

- [x] **Secrets in environment variables only**: Defined in [.env.example](file:///home/yahia/newProject/.env.example). [gitignore](file:///home/yahia/newProject/.gitignore) ignores all `.env*` files.
- [x] **Server-side input validation**: Implemented in [lib/validation.js](file:///home/yahia/newProject/lib/validation.js) validating registration emails, password length (min 8), profile name lengths (max 30), and watch progress numbers.
- [x] **Authorization boundary check**: Verified in [test/backend.test.js](file:///home/yahia/newProject/test/backend.test.js) ensuring a second user receives an unauthorized rejection on private records.
- [x] **Rate limiting**: Throttled watch history sync heartbeats (max 1 update per 10s per stream).
- [x] **Webhook signature verification**: Verified in `lib/stripe.js` with timestamp tolerance and idempotency cache.
- [x] **Asset limits & security**: Media served via Cloudflare R2 object storage with byte-range streaming; no file execution on web server.
- [x] **No sensitive user data in URLs or logs**: Query parameters sanitize passwords; tokens passed via headers and cookies.
- [x] **Dependencies audited**: Zero high-severity vulnerabilities.

---

## 7. Test Results Summary

Executed test suite: `node test/backend.test.js`
- Password hashing (PBKDF2): **PASSED**
- Session cryptographic signing & cookie formatting: **PASSED**
- Second user access rejection: **PASSED**
- Input validation: **PASSED**
- Stripe checkout & webhook idempotency: **PASSED**
- Transactional email queueing: **PASSED**
