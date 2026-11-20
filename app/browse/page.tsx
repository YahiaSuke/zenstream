'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BrowsePage() {
  const [catalog, setCatalog] = useState<any>(null);

  useEffect(() => {
    fetch('/api/catalog/browse?profileId=p-001')
      .then((res) => res.json())
      .then((data) => setCatalog(data))
      .catch((err) => console.error(err));
  }, []);

  if (!catalog) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading Catalog...
      </div>
    );
  }

  const { billboard, rows } = catalog;

  return (
    <div className="min-h-screen bg-bg text-white">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Link href="/browse" className="brand-logo">
            ZENSTREAM
          </Link>
          <ul className="nav-links">
            <li><Link href="/browse" className="nav-link active">Home</Link></li>
            <li><Link href="/browse/tv-shows" className="nav-link">TV Shows</Link></li>
            <li><Link href="/browse/movies" className="nav-link">Movies</Link></li>
            <li><Link href="/browse/my-list" className="nav-link">My List</Link></li>
          </ul>
        </div>
        <div className="nav-actions">
          <Link href="/profiles" className="profile-menu-btn">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center font-bold">
              Y
            </div>
          </Link>
        </div>
      </nav>

      {/* Billboard Hero */}
      <section
        className="billboard"
        style={{ backgroundImage: `url(${billboard.backdropUrl})` }}
      >
        <div className="billboard-vignette" />
        <div className="billboard-content">
          <h1 className="billboard-title">{billboard.title}</h1>
          <p className="billboard-synopsis">{billboard.synopsis}</p>
          <div className="billboard-actions">
            <Link href={`/watch/${billboard.id}`} className="btn btn-primary">
              <span>▶</span> Play
            </Link>
            <button className="btn btn-secondary">
              <span>ℹ</span> More Info
            </button>
          </div>
        </div>
      </section>

      {/* Category Rows */}
      <main className="catalog-rows">
        {rows.map((row: any) => (
          <div key={row.id} className="row-section">
            <h3 className="row-header">{row.title}</h3>
            <div className="carousel-track">
              {row.items.map((item: any) => (
                <div key={item.id} className="title-card">
                  <img src={item.thumbnailUrl} alt={item.title} loading="lazy" />
                  <div className="card-overlay">
                    <div className="card-title">{item.title}</div>
                    <div className="card-meta">
                      <span className="score-match">{item.matchScore}% Match</span>
                      <span className="badge-rating">{item.maturityRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
