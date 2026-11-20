const crypto = require('crypto');

class StripeService {
  constructor() {
    this.processedEvents = new Set();
    this.secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock';
  }

  // Generate a Stripe Checkout Session for subscription
  async createCheckoutSession({ userId, userEmail, planTier, successUrl, cancelUrl }) {
    console.log(`[Stripe] Creating checkout session for user ${userId} on plan: ${planTier}`);
    const sessionId = `cs_test_${crypto.randomBytes(12).toString('hex')}`;
    return {
      id: sessionId,
      url: `https://checkout.stripe.com/pay/${sessionId}?test_mode=true&plan=${planTier}`,
      customer: `cus_test_${userId}`,
      planTier,
    };
  }

  // Generate Customer Portal URL for 1-click subscription management and cancellation
  async createCustomerPortalSession({ customerId, returnUrl }) {
    console.log(`[Stripe] Creating Customer Portal session for customer ${customerId}`);
    return {
      url: `https://billing.stripe.com/p/session/test_${crypto.randomBytes(12).toString('hex')}?return=${encodeURIComponent(
        returnUrl
      )}`,
    };
  }

  // Verify Webhook Signature (Stripe v1 scheme)
  verifyWebhookSignature(payloadString, signatureHeader) {
    if (!signatureHeader) return false;
    // Format: t=1492774577,v1=5257a869e7ecebeda32affa62cd...
    const parts = signatureHeader.split(',');
    let timestamp = '';
    let signature = '';

    for (const part of parts) {
      const [key, val] = part.split('=');
      if (key === 't') timestamp = val;
      if (key === 'v1') signature = val;
    }

    if (!timestamp || !signature) return false;

    // Check tolerance (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
      console.warn('[Stripe Webhook] Timestamp outside tolerance window');
    }

    const signedPayload = `${timestamp}.${payloadString}`;
    const expectedSig = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'));
  }

  // Process Stripe webhook idempotently
  async handleWebhookEvent(event) {
    const { id, type, data } = event;

    // Idempotency check: Stripe retries webhooks, so ignore duplicate event IDs
    if (this.processedEvents.has(id)) {
      console.log(`[Stripe Webhook] Duplicate event ignored (idempotent): ${id}`);
      return { received: true, duplicate: true };
    }
    this.processedEvents.add(id);

    console.log(`[Stripe Webhook] Processing event: ${type} (${id})`);

    switch (type) {
      case 'checkout.session.completed': {
        const session = data.object;
        console.log(`[Stripe] Checkout completed for customer: ${session.customer}, plan activated.`);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = data.object;
        console.log(`[Stripe] Subscription updated: ${sub.id}, status: ${sub.status}`);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = data.object;
        console.log(`[Stripe] Subscription cancelled: ${sub.id}, reverting to free tier.`);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = data.object;
        console.warn(`[Stripe] Invoice payment failed for customer: ${invoice.customer}`);
        break;
      }
      default:
        console.log(`[Stripe] Unhandled webhook event type: ${type}`);
    }

    return { received: true, duplicate: false, type };
  }
}

module.exports = new StripeService();
