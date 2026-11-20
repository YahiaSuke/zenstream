// ==============================================================================
// ZenStream - Frontend Application Router & View Renderer
// ==============================================================================

const state = {
  currentProfile: null,
  profiles: [],
  catalog: { billboard: null, rows: [] },
  activeModalTitle: null,
  player: {
    active: false,
    title: null,
    videoUrl: null,
    introStart: null,
    introEnd: null,
    nextEpisode: null,
  },
  searchQuery: '',
  searchResults: [],
  myList: [],
  currentTab: 'browse', // browse, movies, tv, my-list, search, account
};

// Initialize App
async function initApp() {
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('scroll', handleNavbarScroll);

  // Load profiles from API
  try {
    const res = await fetch('/api/profiles');
    const data = await res.json();
    state.profiles = data.profiles || [];
    const savedProfileId = localStorage.getItem('active_profile_id');
    state.currentProfile = state.profiles.find((p) => p.id === savedProfileId) || state.profiles[0];
  } catch (err) {
    console.error('Failed to load profiles:', err);
  }

  handleRoute();
}

// Router
function handleRoute() {
  const hash = window.location.hash || '#/browse';

  if (hash.startsWith('#/watch/')) {
    const titleId = hash.replace('#/watch/', '').split('?')[0];
    const urlParams = new URLSearchParams(hash.split('?')[1] || '');
    const episodeId = urlParams.get('episode');
    openPlayer(titleId, episodeId);
    return;
  }

  // Close player if route is not watch
  if (state.player.active) {
    state.player.active = false;
  }

  if (hash === '#/' || hash === '#/landing') {
    renderLandingPage();
  } else if (hash === '#/login' || hash === '#/signup') {
    renderAuthPage();
  } else if (hash === '#/profiles' || hash === '#/manage-profiles') {
    renderProfilesPage();
  } else if (hash === '#/browse/my-list') {
    state.currentTab = 'my-list';
    renderMyListPage();
  } else if (hash === '#/browse/movies') {
    state.currentTab = 'movies';
    renderCatalogPage('movie');
  } else if (hash === '#/browse/tv-shows') {
    state.currentTab = 'tv';
    renderCatalogPage('series');
  } else if (hash.startsWith('#/search')) {
    state.currentTab = 'search';
    const params = new URLSearchParams(hash.split('?')[1] || '');
    state.searchQuery = params.get('q') || '';
    renderSearchPage();
  } else if (hash === '#/your-account') {
    state.currentTab = 'account';
    renderAccountPage();
  } else {
    state.currentTab = 'browse';
    renderCatalogPage();
  }
}

function handleNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// ------------------------------------------------------------------------------
// S01: LANDING PAGE
// ------------------------------------------------------------------------------
function renderLandingPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="navbar" style="background: transparent;">
      <div class="nav-brand">
        <span class="brand-logo">ZENSTREAM</span>
      </div>
      <div>
        <a href="#/login" class="btn btn-accent" style="padding: 0.4rem 1.2rem; font-size: 0.9rem;">Sign In</a>
      </div>
    </header>

    <main class="landing-hero">
      <h1 class="landing-title">Cinema without the noise.</h1>
      <p class="landing-subtitle">Stream hundreds of acclaimed films and series without blaring autoplays or credit cutoffs.</p>
      <p style="margin-bottom: 1.5rem; font-size: 1.1rem; color: #e5e5e5;">Ready for peaceful viewing? Enter your email to begin your 14-day free trial.</p>
      
      <form class="landing-email-form" onsubmit="event.preventDefault(); window.location.hash = '#/browse';">
        <input type="email" required placeholder="Enter your email" class="landing-email-input" value="viewer@zenstream.app" />
        <button type="submit" class="btn btn-accent" style="font-size: 1.1rem; padding: 0 1.8rem;">Start Watching</button>
      </form>
    </main>

    <section style="background: #000; border-top: 8px solid #222; padding: 4rem 4%;">
      <div style="max-width: 900px; margin: 0 auto;">
        <h2 style="font-size: 2.2rem; font-weight: 800; text-align: center; margin-bottom: 2rem;">Frequently Asked Questions</h2>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <details style="background: #2d2d2d; padding: 1.25rem; font-size: 1.2rem; cursor: pointer;">
            <summary style="font-weight: 600;">What is StreamFlow?</summary>
            <p style="margin-top: 1rem; color: #a3a3a3; font-size: 1rem;">StreamFlow is a subscription streaming service that allows our members to watch TV shows and movies on an internet-connected device.</p>
          </details>
          <details style="background: #2d2d2d; padding: 1.25rem; font-size: 1.2rem; cursor: pointer;">
            <summary style="font-weight: 600;">How much does StreamFlow cost?</summary>
            <p style="margin-top: 1rem; color: #a3a3a3; font-size: 1rem;">Watch StreamFlow on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee.</p>
          </details>
          <details style="background: #2d2d2d; padding: 1.25rem; font-size: 1.2rem; cursor: pointer;">
            <summary style="font-weight: 600;">Where can I watch?</summary>
            <p style="margin-top: 1rem; color: #a3a3a3; font-size: 1rem;">Watch anywhere, anytime. Sign in with your StreamFlow account to watch instantly on the web from your personal computer.</p>
          </details>
        </div>
      </div>
    </section>
  `;
}

// ------------------------------------------------------------------------------
// S02: AUTH PAGE
// ------------------------------------------------------------------------------
function renderAuthPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="navbar" style="background: transparent;">
      <div class="nav-brand">
        <a href="#/" class="brand-logo">ZENSTREAM</a>
      </div>
    </header>

    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1920&q=80') center/cover; padding: 1rem;">
      <div style="width: 100%; max-width: 440px; background: rgba(0,0,0,0.78); padding: 3.5rem 3rem; border-radius: 4px; box-shadow: 0 8px 32px rgba(0,0,0,0.8);">
        <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1.75rem;">Sign In</h1>
        <form onsubmit="event.preventDefault(); window.location.hash = '#/browse';" style="display: flex; flex-direction: column; gap: 1.2rem;">
          <div>
            <input type="email" required placeholder="Email or phone number" value="user@streamflow.local" style="width: 100%; height: 50px; background: #333; border: 1px solid #444; border-radius: 4px; padding: 0 1rem; color: #fff;" />
          </div>
          <div>
            <input type="password" required placeholder="Password" value="••••••••••••" style="width: 100%; height: 50px; background: #333; border: 1px solid #444; border-radius: 4px; padding: 0 1rem; color: #fff;" />
          </div>
          <button type="submit" class="btn btn-accent" style="height: 50px; font-size: 1.05rem; margin-top: 1rem;">Sign In</button>
          
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #b3b3b3;">
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" checked /> Remember me
            </label>
            <a href="#" style="color: #b3b3b3;">Need help?</a>
          </div>
        </form>

        <div style="margin-top: 3rem; font-size: 0.95rem; color: #737373;">
          New to StreamFlow? <a href="#/" style="color: #fff; font-weight: 500;">Sign up now</a>.
        </div>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------------------------
// S03: PROFILE SELECTION PAGE
// ------------------------------------------------------------------------------
function renderProfilesPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="profiles-screen">
      <h1 class="profiles-title">Who's watching?</h1>
      <div class="profiles-list">
        ${state.profiles
          .map(
            (p) => `
          <div class="profile-item" onclick="selectProfile('${p.id}')">
            <img src="${p.avatar}" alt="${p.name}" class="profile-avatar-lg" />
            <span class="profile-name">${p.name} ${p.isKid ? '<span style="font-size: 0.7rem; background: var(--color-accent); padding: 1px 4px; border-radius: 2px; color: var(--color-on-accent); font-weight: bold;">KIDS</span>' : ''}</span>
          </div>
        `
          )
          .join('')}
        <div class="profile-item" onclick="openAddProfileModal()">
          <div class="profile-avatar-lg" style="display: flex; align-items: center; justify-content: center; background: #222; font-size: 3rem; color: #737373;">
            ＋
          </div>
          <span class="profile-name">Add Profile</span>
        </div>
      </div>
      <button class="btn" style="border: 1px solid #737373; color: #737373; padding: 0.5rem 1.5rem; letter-spacing: 2px; text-transform: uppercase; font-size: 0.85rem;" onclick="alert('Profile management mode active')">
        Manage Profiles
      </button>
    </div>
  `;
}

function selectProfile(profileId) {
  state.currentProfile = state.profiles.find((p) => p.id === profileId);
  localStorage.setItem('active_profile_id', profileId);
  window.location.hash = '#/browse';
}

function openAddProfileModal() {
  const name = prompt('Enter new profile name:');
  if (!name) return;
  const isKid = confirm('Is this a profile for Kids?');
  fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, isKid }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) alert(data.error);
      else {
        state.profiles.push(data.profile);
        renderProfilesPage();
      }
    });
}

// ------------------------------------------------------------------------------
// S04 & S08: BROWSE CATALOG PAGE
// ------------------------------------------------------------------------------
async function renderCatalogPage(filterType = null) {
  const profileId = state.currentProfile ? state.currentProfile.id : 'p-001';
  let catalogUrl = `/api/catalog/browse?profileId=${profileId}`;

  const app = document.getElementById('app');
  app.innerHTML = renderNavbar() + `<div style="padding: 10rem 4%; text-align: center;">Loading catalog...</div>`;

  try {
    const res = await fetch(catalogUrl);
    const data = await res.json();
    state.catalog = data;

    let rows = data.rows;
    if (filterType) {
      rows = rows
        .map((row) => ({
          ...row,
          items: row.items.filter((item) => item.type === filterType),
        }))
        .filter((row) => row.items.length > 0);
    }

    const billboard = data.billboard;

    app.innerHTML = `
      ${renderNavbar()}
      
      <!-- Billboard Hero -->
      <section class="billboard" style="background-image: url('${billboard.backdropUrl}');">
        <div class="billboard-vignette"></div>
        <div class="billboard-content">
          <h1 class="billboard-title">${billboard.title}</h1>
          <p class="billboard-synopsis">${billboard.synopsis}</p>
          <div class="billboard-actions">
            <button class="btn btn-primary" onclick="openPlayer('${billboard.id}')">
              <span>▶</span> Play
            </button>
            <button class="btn btn-secondary" onclick="openDetailsModal('${billboard.id}')">
              <span>ℹ</span> More Info
            </button>
          </div>
        </div>
      </section>

      <!-- Rows -->
      <main class="catalog-rows">
        ${rows
          .map(
            (row) => `
          <div class="row-section">
            <h3 class="row-header">${row.title}</h3>
            <div class="carousel-track-wrapper">
              <button class="carousel-btn left" onclick="scrollCarousel(this, -1)">‹</button>
              <div class="carousel-track">
                ${row.items
                  .map(
                    (item) => `
                  <div class="title-card" onclick="openDetailsModal('${item.id}')">
                    <img src="${item.thumbnailUrl}" alt="${item.title}" loading="lazy" />
                    ${
                      item.progressPercent !== undefined
                        ? `
                      <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${item.progressPercent}%;"></div>
                      </div>
                    `
                        : ''
                    }
                    <div class="card-overlay">
                      <div class="card-title">${item.title}</div>
                      <div class="card-meta">
                        <span class="score-match">${item.matchScore}% Match</span>
                        <span class="badge-rating">${item.maturityRating}</span>
                        <span>${item.type === 'movie' ? item.duration || '2h' : `${item.totalSeasons || 1} Seasons`}</span>
                      </div>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
              <button class="carousel-btn right" onclick="scrollCarousel(this, 1)">›</button>
            </div>
          </div>
        `
          )
          .join('')}
      </main>

      <!-- Details Modal Placeholder -->
      <div id="modal-container"></div>
    `;
  } catch (err) {
    app.innerHTML = `<div style="padding: 10rem 4%; color: red;">Failed to load catalog: ${err.message}</div>`;
  }
}

function renderNavbar() {
  const profile = state.currentProfile || { name: 'Yahia', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80' };
  return `
    <nav class="navbar">
      <div class="nav-brand">
        <a href="#/browse" class="brand-logo">ZENSTREAM</a>
        <ul class="nav-links">
          <li><a href="#/browse" class="nav-link ${state.currentTab === 'browse' ? 'active' : ''}">Home</a></li>
          <li><a href="#/browse/tv-shows" class="nav-link ${state.currentTab === 'tv' ? 'active' : ''}">TV Shows</a></li>
          <li><a href="#/browse/movies" class="nav-link ${state.currentTab === 'movies' ? 'active' : ''}">Movies</a></li>
          <li><a href="#/browse/my-list" class="nav-link ${state.currentTab === 'my-list' ? 'active' : ''}">My List</a></li>
        </ul>
      </div>
      <div class="nav-actions">
        <form onsubmit="event.preventDefault(); const q = this.querySelector('input').value; window.location.hash = '#/search?q=' + encodeURIComponent(q);">
          <input type="text" placeholder="Titles, people, genres" value="${state.searchQuery}" class="nav-search-input" />
        </form>
        <div class="profile-menu-btn" onclick="window.location.hash = '#/profiles'">
          <img src="${profile.avatar}" alt="${profile.name}" class="profile-menu-avatar" />
        </div>
        <a href="#/your-account" style="font-size: 0.85rem; color: #a3a3a3;">Account</a>
      </div>
    </nav>
  `;
}

function scrollCarousel(button, direction) {
  const track = button.parentElement.querySelector('.carousel-track');
  const scrollAmount = track.clientWidth * 0.75;
  track.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
}

// ------------------------------------------------------------------------------
// S05: TITLE DETAILS MODAL
// ------------------------------------------------------------------------------
async function openDetailsModal(titleId) {
  const modalBox = document.getElementById('modal-container');
  if (!modalBox) return;

  try {
    const res = await fetch(`/api/titles/${titleId}`);
    const { title, similar } = await res.json();
    state.activeModalTitle = title;

    modalBox.innerHTML = `
      <div class="modal-overlay" onclick="closeDetailsModal(event)">
        <div class="modal-container" onclick="event.stopPropagation()">
          <button class="modal-close-btn" onclick="closeDetailsModal()">✕</button>
          
          <div class="modal-hero" style="background-image: url('${title.backdropUrl}');">
            <div class="modal-hero-vignette"></div>
            <div class="modal-hero-content">
              <h2 style="font-size: 2.4rem; font-weight: 900; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">${title.title}</h2>
              <div style="display: flex; gap: 0.75rem; align-items: center;">
                <button class="btn btn-primary" onclick="openPlayer('${title.id}')">
                  <span>▶</span> Play
                </button>
                <button class="btn btn-icon" onclick="toggleMyList('${title.id}', this)" title="Add to My List">
                  ＋
                </button>
                <button class="btn btn-icon" onclick="rateTitle('${title.id}', 'like', this)" title="Thumbs Up">
                  👍
                </button>
              </div>
            </div>
          </div>

          <div class="modal-body">
            <div>
              <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem; font-size: 0.95rem;">
                <span class="score-match">${title.matchScore}% Match</span>
                <span class="badge-rating">${title.maturityRating}</span>
                <span style="color: #a3a3a3;">${title.releaseYear}</span>
                <span style="color: #a3a3a3;">${title.type === 'movie' ? title.duration : `${title.totalSeasons} Seasons`}</span>
                <span style="font-size: 0.7rem; border: 1px solid #737373; padding: 1px 4px; border-radius: 2px;">HD</span>
              </div>
              <p style="font-size: 1.05rem; line-height: 1.5; color: #fff;">${title.synopsis}</p>
            </div>
            <div style="font-size: 0.85rem; color: #777; display: flex; flex-direction: column; gap: 0.5rem;">
              <div><span style="color: #555;">Cast:</span> <span style="color: #ddd;">${(title.cast || []).join(', ')}</span></div>
              <div><span style="color: #555;">Genres:</span> <span style="color: #ddd;">Action, Sci-Fi</span></div>
            </div>
          </div>

          ${
            title.seasons && title.seasons.length > 0
              ? `
            <div class="episodes-list">
              <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem;">Episodes</h3>
              ${title.seasons[0].episodes
                .map(
                  (ep) => `
                <div class="episode-item" onclick="openPlayer('${title.id}', '${ep.id}')">
                  <span style="font-size: 1.25rem; font-weight: bold; color: #737373; width: 24px;">${ep.episodeNumber}</span>
                  <img src="${ep.thumbnailUrl}" class="ep-thumb" alt="${ep.title}" />
                  <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 0.3rem;">
                      <span>${ep.title}</span>
                      <span style="color: #a3a3a3; font-size: 0.9rem;">${ep.duration}</span>
                    </div>
                    <p style="font-size: 0.85rem; color: #a3a3a3;">${ep.synopsis}</p>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          <div style="padding: 0 2rem 2rem 2rem;">
            <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem;">More Like This</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
              ${(similar || [])
                .map(
                  (sim) => `
                <div class="title-card" style="width: 100%; min-width: 0;" onclick="openDetailsModal('${sim.id}')">
                  <img src="${sim.thumbnailUrl}" alt="${sim.title}" />
                  <div class="card-overlay">
                    <div class="card-title">${sim.title}</div>
                    <div class="card-meta">
                      <span class="score-match">${sim.matchScore}% Match</span>
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load modal details:', err);
  }
}

function closeDetailsModal(e) {
  const modalBox = document.getElementById('modal-container');
  if (modalBox) modalBox.innerHTML = '';
}

async function toggleMyList(titleId, button) {
  const profileId = state.currentProfile ? state.currentProfile.id : 'p-001';
  await fetch('/api/my-list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, titleId }),
  });
  if (button) button.innerHTML = '✓';
}

async function rateTitle(titleId, rating, button) {
  const profileId = state.currentProfile ? state.currentProfile.id : 'p-001';
  await fetch('/api/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, titleId, rating }),
  });
  if (button) button.style.borderColor = '#4ade80';
}

// ------------------------------------------------------------------------------
// S06: CUSTOM VIDEO PLAYER VIEW
// ------------------------------------------------------------------------------
async function openPlayer(titleId, episodeId = null) {
  const res = await fetch(`/api/titles/${titleId}`);
  const { title } = await res.json();
  if (!title) return;

  let streamUrl = title.videoUrl || title.trailerUrl;
  let epTitle = '';
  let introStart = title.introStartSec || 5;
  let introEnd = title.introEndSec || 20;

  if (episodeId && title.seasons) {
    for (const s of title.seasons) {
      const ep = s.episodes.find((e) => e.id === episodeId);
      if (ep) {
        streamUrl = ep.videoUrl;
        epTitle = ` : ${ep.title}`;
        introStart = ep.introStartSec || 5;
        introEnd = ep.introEndSec || 20;
        break;
      }
    }
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="player-screen" id="player-container">
      <video id="main-video" class="player-video" autoplay src="${streamUrl}"></video>
      
      <button id="skip-intro-btn" class="skip-intro-btn" style="display: none;" onclick="skipIntro(${introEnd})">
        Skip Intro
      </button>

      <div class="player-overlay" id="player-overlay">
        <div class="player-header">
          <button class="btn btn-icon" onclick="window.location.hash = '#/browse'" style="border: none; font-size: 1.5rem;">
            ←
          </button>
          <h2 style="font-size: 1.25rem; font-weight: 700;">${title.title}${epTitle}</h2>
        </div>

        <div class="player-footer">
          <div class="scrub-bar-track" onclick="handleScrub(event)">
            <div id="scrub-progress" class="scrub-bar-progress" style="width: 0%;"></div>
          </div>
          
          <div class="player-controls-row">
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <button class="btn btn-icon" id="play-pause-btn" onclick="togglePlayPause()" style="border: none; font-size: 1.4rem;">
                ⏸
              </button>
              <button class="btn btn-icon" onclick="skipTime(-10)" style="border: none; font-size: 1.1rem;">
                ↺ 10
              </button>
              <button class="btn btn-icon" onclick="skipTime(10)" style="border: none; font-size: 1.1rem;">
                ↻ 10
              </button>
              <span id="player-time" style="font-size: 0.85rem; color: #a3a3a3; font-family: monospace;">0:00 / 0:00</span>
            </div>

            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <button class="btn btn-icon" onclick="toggleFullscreen()" style="border: none; font-size: 1.2rem;">
                ⛶
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  initPlayerEvents(titleId, episodeId, introStart, introEnd);
}

function initPlayerEvents(titleId, episodeId, introStart, introEnd) {
  const video = document.getElementById('main-video');
  const skipBtn = document.getElementById('skip-intro-btn');
  const progressBar = document.getElementById('scrub-progress');
  const timeDisplay = document.getElementById('player-time');
  const overlay = document.getElementById('player-overlay');
  let idleTimer = null;

  function resetIdle() {
    overlay.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      overlay.classList.add('idle');
    }, 3000);
  }

  window.addEventListener('mousemove', resetIdle);

  video.addEventListener('timeupdate', () => {
    const cur = video.currentTime;
    const dur = video.duration || 1;
    const pct = (cur / dur) * 100;
    progressBar.style.width = `${pct}%`;

    const m = Math.floor(cur / 60);
    const s = Math.floor(cur % 60);
    const dm = Math.floor(dur / 60);
    const ds = Math.floor(dur % 60);
    timeDisplay.textContent = `${m}:${String(s).padStart(2, '0')} / ${dm}:${String(ds).padStart(2, '0')}`;

    // Skip Intro Trigger
    if (cur >= introStart && cur <= introEnd) {
      skipBtn.style.display = 'block';
    } else {
      skipBtn.style.display = 'none';
    }
  });

  // Sync Watch History Heartbeat every 10 seconds
  setInterval(() => {
    if (!video.paused && video.duration) {
      const profileId = state.currentProfile ? state.currentProfile.id : 'p-001';
      fetch('/api/watch-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          titleId,
          episodeId,
          progressSeconds: Math.floor(video.currentTime),
          durationSeconds: Math.floor(video.duration),
        }),
      });
    }
  }, 10000);
}

function togglePlayPause() {
  const video = document.getElementById('main-video');
  const btn = document.getElementById('play-pause-btn');
  if (video.paused) {
    video.play();
    btn.textContent = '⏸';
  } else {
    video.pause();
    btn.textContent = '▶';
  }
}

function skipTime(delta) {
  const video = document.getElementById('main-video');
  if (video) video.currentTime += delta;
}

function skipIntro(targetSeconds) {
  const video = document.getElementById('main-video');
  if (video) {
    video.currentTime = targetSeconds;
    const skipBtn = document.getElementById('skip-intro-btn');
    if (skipBtn) skipBtn.style.display = 'none';
  }
}

function handleScrub(e) {
  const video = document.getElementById('main-video');
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const pct = clickX / rect.width;
  if (video && video.duration) {
    video.currentTime = pct * video.duration;
  }
}

function toggleFullscreen() {
  const container = document.getElementById('player-container');
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch((err) => console.log(err));
  } else {
    document.exitFullscreen();
  }
}

// ------------------------------------------------------------------------------
// S07: INSTANT SEARCH PAGE
// ------------------------------------------------------------------------------
async function renderSearchPage() {
  const app = document.getElementById('app');
  app.innerHTML = renderNavbar() + `<div style="padding: 6rem 4%;">Loading search...</div>`;

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(state.searchQuery)}`);
    const { results } = await res.json();

    app.innerHTML = `
      ${renderNavbar()}
      <main style="padding: 7rem 4% 4rem 4%;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">
          ${state.searchQuery ? `Search results for "${state.searchQuery}"` : 'Explore titles'}
        </h2>

        ${
          results.length === 0
            ? `
          <div style="color: #a3a3a3; font-size: 1.1rem; margin-top: 2rem;">
            Your search for "${state.searchQuery}" did not find any matches.<br/><br/>
            Suggestions:
            <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
              <li>Try different keywords</li>
              <li>Looking for a movie or TV show?</li>
              <li>Try using a movie title, actor, or genre</li>
            </ul>
          </div>
        `
            : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
            ${results
              .map(
                (item) => `
              <div class="title-card" style="width: 100%; min-width: 0;" onclick="openDetailsModal('${item.id}')">
                <img src="${item.thumbnailUrl}" alt="${item.title}" />
                <div class="card-overlay">
                  <div class="card-title">${item.title}</div>
                  <div class="card-meta">
                    <span class="score-match">${item.matchScore}% Match</span>
                    <span class="badge-rating">${item.maturityRating}</span>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `
        }
      </main>
      <div id="modal-container"></div>
    `;
  } catch (err) {
    app.innerHTML = `<div style="padding: 7rem 4%; color: red;">Failed to search: ${err.message}</div>`;
  }
}

// ------------------------------------------------------------------------------
// S09: MY LIST PAGE
// ------------------------------------------------------------------------------
async function renderMyListPage() {
  const profileId = state.currentProfile ? state.currentProfile.id : 'p-001';
  const app = document.getElementById('app');
  app.innerHTML = renderNavbar() + `<div style="padding: 7rem 4%;">Loading My List...</div>`;

  try {
    const res = await fetch(`/api/my-list?profileId=${profileId}`);
    const { items } = await res.json();

    app.innerHTML = `
      ${renderNavbar()}
      <main style="padding: 7rem 4% 4rem 4%;">
        <h2 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 1.5rem;">My List</h2>

        ${
          items.length === 0
            ? `
          <div style="color: #a3a3a3; font-size: 1.1rem; margin-top: 2rem;">
            You haven't added any titles to your list yet. Browse through the catalog and click the "＋" button to save titles here.
          </div>
        `
            : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
            ${items
              .map(
                (item) => `
              <div class="title-card" style="width: 100%; min-width: 0;" onclick="openDetailsModal('${item.id}')">
                <img src="${item.thumbnailUrl}" alt="${item.title}" />
                <div class="card-overlay">
                  <div class="card-title">${item.title}</div>
                  <div class="card-meta">
                    <span class="score-match">${item.matchScore}% Match</span>
                    <span class="badge-rating">${item.maturityRating}</span>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `
        }
      </main>
      <div id="modal-container"></div>
    `;
  } catch (err) {
    app.innerHTML = `<div style="padding: 7rem 4%; color: red;">Failed to load My List: ${err.message}</div>`;
  }
}

// ------------------------------------------------------------------------------
// S10: ACCOUNT & SETTINGS PAGE
// ------------------------------------------------------------------------------
async function renderAccountPage() {
  const app = document.getElementById('app');
  app.innerHTML = renderNavbar() + `<div style="padding: 7rem 4%;">Loading Account...</div>`;

  try {
    const res = await fetch('/api/account');
    const { user, profiles } = await res.json();

    app.innerHTML = `
      ${renderNavbar()}
      <main style="padding: 7rem 4% 4rem 4%; max-width: 900px; margin: 0 auto;">
        <h1 style="font-size: 2.2rem; font-weight: 700; margin-bottom: 2rem; border-bottom: 1px solid #333; padding-bottom: 1rem;">Account</h1>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; padding: 1.5rem 0; border-bottom: 1px solid #333;">
          <div style="color: #a3a3a3; font-weight: 500;">MEMBERSHIP & BILLING</div>
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-weight: 600;">${user.email}</span>
              <a href="#" style="color: #0071eb; font-size: 0.9rem;">Change email</a>
            </div>
            <div style="color: #737373; font-size: 0.9rem;">Password: ********</div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #222; display: flex; justify-content: space-between;">
              <span>Plan: <strong style="text-transform: capitalize;">${user.plan} Ultra HD</strong></span>
              <a href="#" style="color: #0071eb; font-size: 0.9rem;">Change plan</a>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; padding: 1.5rem 0; border-bottom: 1px solid #333;">
          <div style="color: #a3a3a3; font-weight: 500;">PROFILE & PARENTAL CONTROLS</div>
          <div>
            ${profiles
              .map(
                (p) => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #222;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <img src="${p.avatar}" style="width: 40px; height: 40px; border-radius: 4px;" />
                  <div>
                    <div style="font-weight: 600;">${p.name}</div>
                    <div style="font-size: 0.8rem; color: #737373;">${p.isKid ? 'All Maturity Ratings: Kids' : 'All Maturity Ratings'}</div>
                  </div>
                </div>
                <a href="#/profiles" style="color: #0071eb; font-size: 0.9rem;">Manage</a>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </main>
    `;
  } catch (err) {
    app.innerHTML = `<div style="padding: 7rem 4%; color: red;">Failed to load account: ${err.message}</div>`;
  }
}

// Start app
window.addEventListener('DOMContentLoaded', initApp);
