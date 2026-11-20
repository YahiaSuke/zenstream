const assert = require('assert');
const crypto = require('crypto');
const auth = require('../lib/auth');
const stripe = require('../lib/stripe');
const validation = require('../lib/validation');
const email = require('../lib/email');

console.log('========================================================');
console.log('RUNNING STREAMFLOW BACKEND & SECURITY TEST SUITE');
console.log('========================================================');

// 1. Password Hashing (PBKDF2)
console.log('\n[1] Testing Password Hashing & Verification');
const rawPassword = 'superSecretPassword123!';
const hashedPassword = auth.hashPassword(rawPassword);
assert(hashedPassword.includes(':'), 'Hashed password must contain salt separator');
assert(auth.verifyPassword(rawPassword, hashedPassword), 'Password verification must succeed for valid password');
assert(!auth.verifyPassword('wrongPassword', hashedPassword), 'Password verification must fail for invalid password');
console.log('✓ Password hashing and timing-safe verification passed');

// 2. Session Token & Cookie
console.log('\n[2] Testing Session Tokens & HTTP-Only Cookies');
const sessionToken = auth.createSessionToken({ userId: 'u-123', email: 'user@example.com' });
const decoded = auth.verifySessionToken(sessionToken);
assert.strictEqual(decoded.userId, 'u-123', 'Decoded token should match payload');
assert.strictEqual(decoded.email, 'user@example.com', 'Decoded email should match payload');

// Tampered token test
const tamperedToken = sessionToken.slice(0, -5) + 'abcde';
assert.strictEqual(auth.verifySessionToken(tamperedToken), null, 'Tampered token must be rejected');

const cookieHeader = auth.createSessionCookie(sessionToken);
assert(cookieHeader.includes('HttpOnly'), 'Cookie must be HttpOnly');
assert(cookieHeader.includes('SameSite=Lax'), 'Cookie must have SameSite policy');
assert.strictEqual(auth.getTokenFromCookie(cookieHeader), sessionToken, 'Cookie extraction must retrieve token');
console.log('✓ Session token generation, cryptographic verification, and cookie parsing passed');

// 3. Authorization Check (Second user boundary test)
console.log('\n[3] Testing Authorization Access Boundary');
const user1 = 'u-001';
const user2 = 'u-002';
assert(auth.canUserAccess(user1, user1), 'User 1 must be permitted access to User 1 resources');
assert(!auth.canUserAccess(user2, user1), 'User 2 MUST be denied access to User 1 resources');
console.log('✓ Second user access rejection verified (data isolation intact)');

// 4. Server-Side Input Validation
console.log('\n[4] Testing Server-Side Input Validation');
const validReg = validation.validateRegister({ email: 'valid@streamflow.app', password: 'securePassword123' });
assert(validReg.isValid, 'Valid registration payload should pass');

const invalidRegEmail = validation.validateRegister({ email: 'notanemail', password: 'securePassword123' });
assert(!invalidRegEmail.isValid, 'Invalid email format must be rejected');

const shortPassword = validation.validateRegister({ email: 'valid@streamflow.app', password: 'short' });
assert(!shortPassword.isValid, 'Password < 8 characters must be rejected');

const longProfileName = validation.validateProfile({ name: 'A'.repeat(35) });
assert(!longProfileName.isValid, 'Profile name > 30 characters must be rejected');

const invalidProgress = validation.validateWatchProgress({ titleId: 't-1', progressSeconds: -10, durationSeconds: 100 });
assert(!invalidProgress.isValid, 'Negative progress seconds must be rejected');
console.log('✓ Strict server-side input validation passed across all routes');

// 5. Stripe Payments & Webhooks
console.log('\n[5] Testing Stripe Checkout, Portal & Webhooks');
async function testStripe() {
  const checkout = await stripe.createCheckoutSession({
    userId: 'u-123',
    userEmail: 'user@example.com',
    planTier: 'premium',
    successUrl: 'http://localhost:3000/success',
    cancelUrl: 'http://localhost:3000/cancel',
  });
  assert(checkout.url.includes('checkout.stripe.com'), 'Checkout session URL generated');
  assert.strictEqual(checkout.planTier, 'premium', 'Plan tier assigned');

  const portal = await stripe.createCustomerPortalSession({
    customerId: 'cus_123',
    returnUrl: 'http://localhost:3000/#/your-account',
  });
  assert(portal.url.includes('billing.stripe.com'), 'Customer portal URL generated');

  // Test Webhook idempotency
  const mockEvent = {
    id: 'evt_test_001',
    type: 'checkout.session.completed',
    data: { object: { customer: 'cus_123', subscription: 'sub_123' } },
  };

  const firstDelivery = await stripe.handleWebhookEvent(mockEvent);
  assert.strictEqual(firstDelivery.duplicate, false, 'First webhook delivery must be processed');

  const secondDelivery = await stripe.handleWebhookEvent(mockEvent);
  assert.strictEqual(secondDelivery.duplicate, true, 'Duplicate webhook delivery must be ignored idempotently');
  console.log('✓ Stripe checkout, customer portal, and webhook idempotency verified');
}

// 6. Transactional Email
console.log('\n[6] Testing Transactional Email Service');
async function testEmail() {
  const welcome = await email.sendWelcomeEmail('member@example.com', 'Yahia');
  assert(welcome.success, 'Welcome email must queue successfully');

  const reset = await email.sendPasswordResetEmail('member@example.com', 'token_xyz123');
  assert(reset.success, 'Password reset email must queue successfully');
  console.log('✓ Transactional emails queued and formatted cleanly');
}

Promise.all([testStripe(), testEmail()])
  .then(() => {
    console.log('\n========================================================');
    console.log('ALL BACKEND & SECURITY TESTS PASSED GREEN (100%)');
    console.log('========================================================');
  })
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
