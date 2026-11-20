import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <header className="navbar" style={{ background: 'transparent' }}>
        <div className="nav-brand">
          <span className="brand-logo text-accent font-black tracking-wider">ZENSTREAM</span>
        </div>
        <div>
          <Link href="/login" className="btn btn-accent text-sm py-1.5 px-5">
            Sign In
          </Link>
        </div>
      </header>

      <main className="landing-hero flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-4xl sm:text-6xl font-black text-white max-w-4xl tracking-tight mb-4">
          Cinema without the noise.
        </h1>
        <p className="text-lg sm:text-2xl text-neutral-300 max-w-2xl mb-8">
          Stream hundreds of acclaimed independent films and series without blaring autoplay trailers, credit countdowns, or algorithmic traps.
        </p>

        <form className="landing-email-form flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="landing-email-input flex-1 px-4 py-3 bg-surface border border-border text-white rounded-sm focus:border-accent outline-none"
            defaultValue="viewer@zenstream.app"
          />
          <Link
            href="/browse"
            className="btn btn-accent text-base px-6 py-3 font-bold flex items-center justify-center"
          >
            Start Watching
          </Link>
        </form>
      </main>
    </div>
  );
}
