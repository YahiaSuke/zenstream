import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg text-text py-16 px-4 sm:px-8 max-w-4xl mx-auto">
      <Link href="/browse" className="text-accent hover:underline mb-8 inline-block font-semibold">
        ← Back to ZenStream
      </Link>
      <h1 className="text-3xl font-black mb-4">Terms of Service</h1>
      <p className="text-sm text-text-muted mb-8">Effective Date: November 20, 2026</p>

      <section className="space-y-6 text-sm leading-relaxed text-neutral-300">
        <h2 className="text-xl font-bold text-white pt-4">1. Acceptance of Terms</h2>
        <p>
          By creating an account or subscribing to <strong>ZenStream</strong>, you agree to these Terms of Service. If you do not agree, do not use the service.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">2. Subscriptions & Billing</h2>
        <p>
          ZenStream offers monthly and annual subscription plans. All plans include a 14-day free trial. You may cancel your subscription at any time with one click from your Account settings. Upon cancellation, your access remains active until the end of your paid billing period with zero cancellation fees.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">3. Stream Portability & Usage</h2>
        <p>
          Your subscription includes a fixed number of simultaneous streams according to your plan tier. You may access your account across devices anywhere in the world without artificial household IP locks. Account sharing outside of your immediate circle in a commercial resale manner is prohibited.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">4. Intellectual Property</h2>
        <p>
          All video streams, metadata, and custom playback UI provided on ZenStream are licensed or proprietary. You may not re-broadcast, capture, or scrape media streams from the service.
        </p>

        <h2 className="text-xl font-bold text-white pt-4">5. Limitation of Liability</h2>
        <p>
          ZenStream is provided &quot;as is&quot; without warranties of uninterrupted availability. We strive for 99.9% uptime across our global CDN.
        </p>
      </section>
    </div>
  );
}
