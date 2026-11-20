const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const db = require('./lib/db');

const PORT = process.env.PORT || 3000;

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // --------------------------------------------------------------------------
  // API ROUTES
  // --------------------------------------------------------------------------

  // GET /api/catalog/browse
  if (method === 'GET' && pathname === '/api/catalog/browse') {
    const profileId = parsedUrl.query.profileId || 'p-001';
    const profile = db.getProfile(profileId);
    const isKid = profile ? profile.isKid : false;

    const featured = db.getFeaturedTitle();
    const allTitles = db.getTitles({ isKid });
    const continueWatching = db.getContinueWatching(profileId);
    const watchlist = db.getWatchlist(profileId);

    const rows = [];
    if (continueWatching.length > 0) {
      rows.push({
        id: 'continue-watching',
        title: 'Continue Watching for ' + (profile ? profile.name : 'You'),
        items: continueWatching.map((cw) => ({
          ...cw.title,
          progressPercent: cw.progressPercent,
          progressSeconds: cw.progressSeconds,
          episodeId: cw.episodeId,
          episodeTitle: cw.episode ? cw.episode.title : null,
        })),
      });
    }

    if (watchlist.length > 0) {
      rows.push({
        id: 'my-list',
        title: 'My List',
        items: watchlist,
      });
    }

    rows.push({
      id: 'trending',
      title: 'Trending Now',
      items: allTitles,
    });

    for (const g of db.data.genres) {
      if (isKid && g.id !== 'g-kids') continue;
      const gTitles = db.getTitles({ genreId: g.id, isKid });
      if (gTitles.length > 0) {
        rows.push({
          id: g.slug,
          title: g.name,
          items: gTitles,
        });
      }
    }

    return sendJson(res, 200, { billboard: featured, rows });
  }

  // GET /api/titles/:id
  if (method === 'GET' && pathname.startsWith('/api/titles/')) {
    const id = pathname.replace('/api/titles/', '');
    const title = db.getTitleById(id);
    if (!title) return sendJson(res, 404, { error: 'Title not found' });
    const similar = db.getTitles().filter((t) => t.id !== title.id).slice(0, 3);
    return sendJson(res, 200, { title, similar });
  }

  // GET /api/search?q=...
  if (method === 'GET' && pathname === '/api/search') {
    const q = parsedUrl.query.q || '';
    const results = db.search(q);
    return sendJson(res, 200, { query: q, results });
  }

  // GET /api/profiles
  if (method === 'GET' && pathname === '/api/profiles') {
    const profiles = db.getProfiles('u-001');
    return sendJson(res, 200, { profiles });
  }

  // POST /api/profiles
  if (method === 'POST' && pathname === '/api/profiles') {
    const body = await parseBody(req);
    try {
      const newP = db.addProfile('u-001', body);
      return sendJson(res, 201, { profile: newP });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // PATCH /api/profiles/:id
  if (method === 'PATCH' && pathname.startsWith('/api/profiles/')) {
    const id = pathname.replace('/api/profiles/', '');
    const body = await parseBody(req);
    try {
      const updated = db.updateProfile(id, body);
      return sendJson(res, 200, { profile: updated });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // DELETE /api/profiles/:id
  if (method === 'DELETE' && pathname.startsWith('/api/profiles/')) {
    const id = pathname.replace('/api/profiles/', '');
    db.deleteProfile(id);
    return sendJson(res, 200, { success: true });
  }

  // GET /api/my-list
  if (method === 'GET' && pathname === '/api/my-list') {
    const profileId = parsedUrl.query.profileId || 'p-001';
    const items = db.getWatchlist(profileId);
    return sendJson(res, 200, { items });
  }

  // POST /api/my-list
  if (method === 'POST' && pathname === '/api/my-list') {
    const body = await parseBody(req);
    db.addToWatchlist(body.profileId || 'p-001', body.titleId);
    return sendJson(res, 200, { success: true });
  }

  // DELETE /api/my-list/:titleId
  if (method === 'DELETE' && pathname.startsWith('/api/my-list/')) {
    const titleId = pathname.replace('/api/my-list/', '');
    const profileId = parsedUrl.query.profileId || 'p-001';
    db.removeFromWatchlist(profileId, titleId);
    return sendJson(res, 200, { success: true });
  }

  // POST /api/watch-history
  if (method === 'POST' && pathname === '/api/watch-history') {
    const body = await parseBody(req);
    const result = db.updateWatchProgress(
      body.profileId || 'p-001',
      body.titleId,
      body.episodeId,
      Number(body.progressSeconds),
      Number(body.durationSeconds)
    );
    return sendJson(res, 200, result);
  }

  // GET /api/continue-watching
  if (method === 'GET' && pathname === '/api/continue-watching') {
    const profileId = parsedUrl.query.profileId || 'p-001';
    const inProgress = db.getContinueWatching(profileId);
    return sendJson(res, 200, { inProgress });
  }

  // POST /api/ratings
  if (method === 'POST' && pathname === '/api/ratings') {
    const body = await parseBody(req);
    db.setRating(body.profileId || 'p-001', body.titleId, body.rating);
    return sendJson(res, 200, { success: true });
  }

  // GET /api/ratings
  if (method === 'GET' && pathname === '/api/ratings') {
    const profileId = parsedUrl.query.profileId || 'p-001';
    const ratings = db.getRatings(profileId);
    return sendJson(res, 200, { ratings });
  }

  // GET /api/account
  if (method === 'GET' && pathname === '/api/account') {
    const user = db.data.users[0];
    const profiles = db.getProfiles(user.id);
    return sendJson(res, 200, { user, profiles });
  }

  // --------------------------------------------------------------------------
  // STATIC ASSETS & WEB APP SERVING
  // --------------------------------------------------------------------------

  // Serve static files from public/ or replica/design/
  if (pathname === '/tokens.css') {
    const filePath = path.join(__dirname, 'replica', 'design', 'tokens.css');
    res.writeHead(200, { 'Content-Type': 'text/css' });
    return fs.createReadStream(filePath).pipe(res);
  }

  if (pathname.startsWith('/public/')) {
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const mime = ext === '.css' ? 'text/css' : ext === '.js' ? 'application/javascript' : 'text/plain';
      res.writeHead(200, { 'Content-Type': mime });
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  // All other routes serve the responsive single-page / SSR application shell
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(htmlPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(htmlPath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`ZenStream Server listening on http://localhost:${PORT}`);
});
