# Deploy Checklist & Production Guide: ZenStream

Date: 2026-11-20  Commit: Production-Ready (RC1)  Go from user: Ready for final confirmation

---

## 1. Preflight Verification (ALL PASSED)

- [x] **E2E Test Suite Green**: **20 of 20 passed (100%)** via `node e2e/test-runner.js`.
- [x] **No Open S1 or S2 Bugs**: Confirmed in [bugs.md](file:///home/yahia/newProject/replica/bugs.md) (0 open S1, 0 open S2, all 3 historical QA issues resolved).
- [x] **Parity Score**: **100.0 / 100** via `parity.py` (All 13 of 13 must-haves completed, 26 total features implemented).
- [x] **Rebrand Sweep Clean**: Exit code 0 via `sweep.py . --config replica/brand.json` ("*Clean. Nothing of the original's name, domain or colours found*").
- [x] **Store Listing Passes**: Exit code 0 via `listing.py` (0 errors, 0 warnings across App Store & Google Play metadata limits).
- [x] **Production App & Primitives Verified**: Clean-room components in [replica/design/primitives/](file:///home/yahia/newProject/replica/design/primitives/) and Next.js App Router structure.
- [x] **Privacy Policy & Terms Live**: Implemented in [app/privacy/page.tsx](file:///home/yahia/newProject/app/privacy/page.tsx) and [app/terms/page.tsx](file:///home/yahia/newProject/app/terms/page.tsx), listing every sub-processor (Stripe, Supabase, Cloudflare R2, Vercel, Resend).
- [x] **Account Deletion Implemented**: Real cascading deletion supported via backend authorization service.
- [x] **Visual Identity Independence**: Distinctive Electric Teal palette (`#00d2c4`), custom wave-play glyph, and WCAG AAA typography.

---

## 2. Production Services Setup

| Service | Environment Variable | Configuration Action |
| --- | --- | --- |
| **PostgreSQL Database** | `DATABASE_URL` | Create dedicated production project on Supabase / Neon. Run `node scripts/migrate.js` to execute [0001_initial_schema.sql](file:///home/yahia/newProject/migrations/0001_initial_schema.sql). Enable automated daily backups. |
| **Stripe Live Mode** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Toggle Stripe dashboard to Live Mode. Create Solo, Traveler, and Patron recurring products. Configure webhook endpoint `https://zenstream.app/api/webhooks/stripe` listening for `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`. |
| **Media Asset Storage** | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Cloudflare R2 bucket with custom public domain `media.zenstream.app`. Enable CORS headers allowing `Range`, `Origin`, and `GET` requests for HTTP 206 video scrubbing. |
| **Transactional Email** | `RESEND_API_KEY`, `EMAIL_FROM` | Add and verify sending domain `zenstream.app` in Resend dashboard. Set sender to `notifications@zenstream.app`. |
| **Session Secret** | `AUTH_SECRET` | Generate high-entropy 64-character random string (`openssl rand -hex 32`). |

---

## 3. Custom Domain & DNS Records Configuration

Domain: `zenstream.app` (Registered at user's preferred registrar like Cloudflare Registrar / Namecheap / Porkbun)

### Web Traffic DNS Records

| Type | Name / Host | Target Value | TTL | Purpose |
| :---: | :---: | :---: | :---: | --- |
| **A** | `@` | `76.76.21.21` (Vercel Apex IP) | Auto / 3600 | Apex domain routing |
| **CNAME** | `www` | `cname.vercel-dns.com` | Auto / 3600 | Subdomain redirect |
| **CNAME** | `media` | `<r2-bucket-id>.cf-ipfs.com` | Auto / 3600 | Direct video CDN streaming |

*Canonical Host*: Redirect `www.zenstream.app` to apex `https://zenstream.app`. HTTPS certificates are auto-provisioned via Let's Encrypt / Vercel Edge.

### Email Deliverability Records (SPF, DKIM, DMARC)

| Type | Name / Host | Value | Purpose |
| :---: | :---: | :---: | --- |
| **TXT** | `@` | `v=spf1 include:amazonses.com ~all` (or Resend SPF) | Authorizes email sending |
| **CNAME** | `resend._domainkey` | `dkim.resend.com` | Cryptographic signature verification |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc-reports@zenstream.app` | DMARC policy reporting |

---

## 4. Monitoring & First-Week Observability

1. **Uptime Monitoring**: Configure Better Uptime or UptimeRobot checking:
   - `GET https://zenstream.app/` (every 60s)
   - `GET https://zenstream.app/api/catalog/browse?profileId=p-001` (every 180s)
2. **Error Tracking**: Sentry DSN configured in production to alert on uncaught video player errors.
3. **Smoke Test Sequence (Post-Deploy)**:
   - [ ] Sign up with a new email address.
   - [ ] Complete a $1 test purchase on Stripe Live mode, verify subscription activates.
   - [ ] Play a video stream for 60 seconds; verify "Continue Watching" progress updates.
   - [ ] Test one-click cancellation in Customer Portal, then refund the test charge.

---

## 5. Mobile Deployment (App Store & Google Play)

- **Expo / React Native**:
  ```bash
  eas build --platform all --profile production
  eas submit --platform ios
  eas submit --platform android
  ```
- **Metadata**: Copy verified descriptions from [replica/launch/listing.json](file:///home/yahia/newProject/replica/launch/listing.json) directly into App Store Connect and Google Play Console.
- **Reviewer Demo Credentials**: Provide test account (`reviewer@zenstream.app` / `TestStream2026!`) with an active demo subscription so Apple/Google reviewers can evaluate the video player immediately without hitting a paywall.
