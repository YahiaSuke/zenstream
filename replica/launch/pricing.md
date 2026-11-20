# Pricing Strategy & Model: ZenStream

Comparative pricing analysis, reviewer complaints audit, subscription tier definitions, and Stripe billing configuration.

---

## 1. Competitive Pricing Benchmarks (As of Nov 2024 / Public Data)

| Service | Entry Tier | Standard Tier | Top Tier (4K / Multi-Stream) | Extra Member Fee | Ads Policy |
| --- | --- | --- | --- | --- | --- |
| **Netflix** | $6.99/mo (With Ads) | $15.49/mo (Ad-free) | $22.99/mo (Premium 4K) | +$7.99/mo per user | Ads on entry tier |
| **Criterion Channel** | $10.99/mo | $10.99/mo | $10.99/mo (Annual $99.99/yr) | None | Strictly Ad-free |
| **MUBI** | $14.99/mo | $14.99/mo | $14.99/mo (Annual $119.88/yr) | None | Strictly Ad-free |
| **Apple TV+** | $9.99/mo | $9.99/mo | $9.99/mo (Family Sharing included) | None | Strictly Ad-free |

*Key finding: The original app's top 4K tier has risen to $22.99/mo and charges $7.99/mo extra for family members living outside the primary home, creating intense resentment among long-time subscribers.*

---

## 2. Reviewer Feedback on Pricing & Billing (From `feedback.md`)
- **8 reviews across 3 sources** explicitly cited pricing and paywalls as the primary reason for canceling.
- Top pain points:
  1. Compounded price increases reaching over $23/month.
  2. Introducing ads on paying tiers.
  3. Paying for 4 streams but being locked out when traveling or sharing with family.
  4. Confusing billing cycles and customer service chatbot loops.

---

## 3. ZenStream Pricing Model

Principles:
- **100% Ad-Free**: No commercial tiers.
- **14-Day Free Trial**: Full access, cancel with one click before trial ends.
- **Annual Discount**: 2 months free on all annual plans (~17% savings).
- **Zero Location Penalty**: Simultaneous streams count anywhere in the world.

### The Three Tiers

| Tier Name | Who It Is For | Monthly | Annual (2 Mos Free) | Features Included |
| --- | --- | :---: | :---: | --- |
| **Solo** | Individual viewers & students | **$7.99/mo** | **$79/yr** | 1 simultaneous stream, 1080p Full HD, ad-free, full library, instant mute switch |
| **Traveler** | Couples, remote workers & nomads | **$11.99/mo** | **$119/yr** | 2 simultaneous streams, 4K Ultra HD, zero location/household locks, speech clarity booster |
| **Patron** | Families & film enthusiasts | **$15.99/mo** | **$159/yr** | 4 simultaneous streams, 4K HDR + Spatial Audio, 5 profiles with kids PIN lock, vote on future titles |

---

## 4. Billing Guarantees Fixed in Product
1. **One-Click Instant Cancellation**: Directly inside `#/your-account` via Stripe Customer Portal. Cancellation takes effect at the end of the paid billing period.
2. **5-Day Renewal Notice**: Clear transactional email sent 5 days before annual renewal charges.
3. **Prorated Upgrades**: Upgrading from Solo to Traveler applies unused days immediately.

---

## 5. Stripe Products & Prices to Create

User creates these in their Stripe Dashboard (Test & Live modes):

```bash
# Products to create:
1. "ZenStream Solo"
   - Price monthly: $7.99 USD recurring (env: STRIPE_PRICE_SOLO_M)
   - Price annual: $79.00 USD recurring (env: STRIPE_PRICE_SOLO_Y)

2. "ZenStream Traveler"
   - Price monthly: $11.99 USD recurring (env: STRIPE_PRICE_TRAVELER_M)
   - Price annual: $119.00 USD recurring (env: STRIPE_PRICE_TRAVELER_Y)

3. "ZenStream Patron"
   - Price monthly: $15.99 USD recurring (env: STRIPE_PRICE_PATRON_M)
   - Price annual: $159.00 USD recurring (env: STRIPE_PRICE_PATRON_Y)
```
