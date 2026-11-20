import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-text py-16 px-4 sm:px-8 max-w-4xl mx-auto">
      <Link href="/browse" className="text-accent hover:underline mb-8 inline-block font-semibold">
        ← Back to ZenStream
      </Link>
      <h1 className="text-3xl font-black mb-4">Privacy Policy</h1>
      <p className="text-sm text-text-muted mb-8">Effective Date: November 20, 2026</p>

      <section className="space-y-6 text-sm leading-relaxed text-neutral-300">
        <p>
          At <strong>ZenStream</strong>, we believe in respectful entertainment. We do not sell your personal data, we do not track you across third-party websites, and we do not serve behavioral target advertisements.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">1. Data We Collect</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Account Information: Your email address and encrypted password hash.</li>
          <li>Streaming Activity: Playback progress seconds to enable &quot;Resume Watching&quot; and personal watchlist items.</li>
          <li>Billing Information: Handled directly and securely by Stripe. We never store credit card numbers on our servers.</li>
        </ul>

        <h2 className="text-xl font-bold text-white pt-4">2. Third-Party Sub-processors</h2>
        <p>We work with trusted infrastructure providers to deliver our service:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Stripe, Inc.</strong>: Payment processing, subscription billing, and customer portal.</li>
          <li><strong>Supabase / Neon</strong>: Managed PostgreSQL database and session authentication.</li>
          <li><strong>Cloudflare, Inc. (R2 Storage)</strong>: Secure video streaming delivery via encrypted HTTPS range requests.</li>
          <li><strong>Vercel, Inc.</strong>: Application hosting, edge caching, and serverless compute.</li>
          <li><strong>Resend, Inc.</strong>: Transactional email notifications (welcome confirmations and password resets).</li>
        </ul>

        <h2 className="text-xl font-bold text-white pt-4">3. Account Deletion & Rights</h2>
        <p>
          You have the right to delete your account at any time. Clicking &quot;Delete Account&quot; in your Account settings permanently purges your user profile, watch history, and personal lists from our databases immediately.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">4. Contact Us</h2>
        <p>
          For privacy inquiries or data export requests, contact our privacy team at <a href="mailto:privacy@zenstream.app" className="text-accent underline">privacy@zenstream.app</a>.
        </p>
      </section>
    </div>
  );
}
