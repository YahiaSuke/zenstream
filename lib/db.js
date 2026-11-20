const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');

class DataStore {
  constructor() {
    this.data = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
  }

  // Titles
  getTitles(filter = {}) {
    let list = [...this.data.titles];
    if (filter.type) {
      list = list.filter((t) => t.type === filter.type);
    }
    if (filter.genreId) {
      list = list.filter((t) => t.genreIds.includes(filter.genreId));
    }
    if (filter.isKid) {
      list = list.filter((t) => t.maturityRating === 'ALL' || t.maturityRating === '7+');
    }
    return list;
  }

  getFeaturedTitle() {
    return this.data.titles.find((t) => t.isFeatured) || this.data.titles[0];
  }

  getTitleById(id) {
    return this.data.titles.find((t) => t.id === id || t.slug === id);
  }

  search(query) {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    return this.data.titles.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.synopsis.toLowerCase().includes(q) ||
        t.cast.some((c) => c.toLowerCase().includes(q))
    );
  }

  // Profiles
  getProfiles(userId = 'u-001') {
    return this.data.profiles.filter((p) => p.userId === userId);
  }

  getProfile(profileId) {
    return this.data.profiles.find((p) => p.id === profileId);
  }

  addProfile(userId, { name, avatar, isKid }) {
    const existing = this.getProfiles(userId);
    if (existing.length >= 5) {
      throw new Error('Maximum 5 profiles allowed per account');
    }
    const newProfile = {
      id: `p-${Date.now()}`,
      userId,
      name: name.trim(),
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      isKid: !!isKid,
      language: 'en',
      autoplayNext: true,
      autoplayPreviews: true,
    };
    this.data.profiles.push(newProfile);
    return newProfile;
  }

  updateProfile(profileId, updates) {
    const p = this.getProfile(profileId);
    if (!p) throw new Error('Profile not found');
    if (updates.name) p.name = updates.name.trim();
    if (updates.avatar) p.avatar = updates.avatar;
    if (updates.isKid !== undefined) p.isKid = updates.isKid;
    return p;
  }

  deleteProfile(profileId) {
    this.data.profiles = this.data.profiles.filter((p) => p.id !== profileId);
    delete this.data.continueWatching[profileId];
    delete this.data.watchlist[profileId];
    delete this.data.ratings[profileId];
    return true;
  }

  // Watchlist
  getWatchlist(profileId) {
    const ids = this.data.watchlist[profileId] || [];
    return this.data.titles.filter((t) => ids.includes(t.id));
  }

  addToWatchlist(profileId, titleId) {
    if (!this.data.watchlist[profileId]) {
      this.data.watchlist[profileId] = [];
    }
    if (!this.data.watchlist[profileId].includes(titleId)) {
      this.data.watchlist[profileId].unshift(titleId);
    }
    return true;
  }

  removeFromWatchlist(profileId, titleId) {
    if (this.data.watchlist[profileId]) {
      this.data.watchlist[profileId] = this.data.watchlist[profileId].filter(
        (id) => id !== titleId
      );
    }
    return true;
  }

  // Continue Watching
  getContinueWatching(profileId) {
    const records = this.data.continueWatching[profileId] || [];
    return records
      .map((r) => {
        const title = this.getTitleById(r.titleId);
        if (!title) return null;
        let ep = null;
        if (r.episodeId && title.seasons) {
          for (const s of title.seasons) {
            ep = s.episodes.find((e) => e.id === r.episodeId);
            if (ep) break;
          }
        }
        return {
          ...r,
          title,
          episode: ep,
        };
      })
      .filter(Boolean);
  }

  updateWatchProgress(profileId, titleId, episodeId, progressSeconds, durationSeconds) {
    if (!this.data.continueWatching[profileId]) {
      this.data.continueWatching[profileId] = [];
    }
    const list = this.data.continueWatching[profileId];
    const existingIndex = list.findIndex(
      (r) => r.titleId === titleId && (r.episodeId === episodeId || (!r.episodeId && !episodeId))
    );

    const progressPercent = Math.min(100, Math.round((progressSeconds / durationSeconds) * 100));

    // If watched > 95%, mark complete and remove from continue watching
    if (progressPercent >= 95) {
      if (existingIndex !== -1) {
        list.splice(existingIndex, 1);
      }
      return { completed: true };
    }

    const record = {
      titleId,
      episodeId: episodeId || null,
      progressSeconds,
      durationSeconds,
      progressPercent,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      list[existingIndex] = record;
    } else {
      list.unshift(record);
    }

    return { completed: false, record };
  }

  // Ratings
  getRatings(profileId) {
    return this.data.ratings[profileId] || {};
  }

  setRating(profileId, titleId, rating) {
    if (!this.data.ratings[profileId]) {
      this.data.ratings[profileId] = {};
    }
    this.data.ratings[profileId][titleId] = rating;
    return true;
  }
}

module.exports = new DataStore();
