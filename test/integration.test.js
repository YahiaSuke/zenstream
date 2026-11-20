const assert = require('assert');
const db = require('../lib/db');

console.log('--- RUNNING INTEGRATION TESTS FOR STREAMFLOW BACKEND & DATA LAYER ---');

// 1. Catalog & Discovery
const titles = db.getTitles();
assert(titles.length >= 6, 'Should have at least 6 titles');
console.log('✓ Catalog listing passed (Count: ' + titles.length + ')');

const featured = db.getFeaturedTitle();
assert(featured && featured.id, 'Featured title exists');
console.log('✓ Featured billboard title: ' + featured.title);

// 2. Multi-Profile Management
const profiles = db.getProfiles('u-001');
assert.strictEqual(profiles.length, 3, 'Initial profiles count should be 3');
console.log('✓ Profiles loaded: ' + profiles.map(p => p.name).join(', '));

// Add Profile (4th profile)
const p4 = db.addProfile('u-001', { name: 'Guest', isKid: false });
assert.strictEqual(db.getProfiles('u-001').length, 4, 'Profiles count should be 4');
console.log('✓ Created 4th profile: ' + p4.name);

// Add 5th profile
const p5 = db.addProfile('u-001', { name: 'Family', isKid: true });
assert.strictEqual(db.getProfiles('u-001').length, 5, 'Profiles count should be 5');
console.log('✓ Created 5th profile: ' + p5.name);

// Test Profile limit (6th profile must fail)
assert.throws(() => {
  db.addProfile('u-001', { name: 'Exceeded', isKid: false });
}, /Maximum 5 profiles allowed/, 'Should throw limit error on 6th profile');
console.log('✓ Max 5 profiles limit enforced successfully');

// Clean up created profiles
db.deleteProfile(p4.id);
db.deleteProfile(p5.id);
assert.strictEqual(db.getProfiles('u-001').length, 3, 'Restored to 3 profiles');

// 3. Watchlist (My List)
const initialList = db.getWatchlist('p-001');
console.log('✓ Initial My List count: ' + initialList.length);

db.addToWatchlist('p-001', 't-002');
const updatedList = db.getWatchlist('p-001');
assert(updatedList.some(t => t.id === 't-002'), 't-002 should be in My List');
console.log('✓ Added title to My List successfully');

db.removeFromWatchlist('p-001', 't-002');
const finalList = db.getWatchlist('p-001');
assert(!finalList.some(t => t.id === 't-002'), 't-002 should be removed');
console.log('✓ Removed title from My List successfully');

// 4. Continue Watching (Playback Progress)
const cwBefore = db.getContinueWatching('p-001');
assert(cwBefore.length > 0, 'Should have continue watching items');
console.log('✓ Continue Watching items: ' + cwBefore.map(c => `${c.title.title} (${c.progressPercent}%)`).join(', '));

// Update progress to 60%
db.updateWatchProgress('p-001', 't-001', 'ep-101', 1944, 3240);
const cwAfter = db.getContinueWatching('p-001');
const epRecord = cwAfter.find(c => c.titleId === 't-001');
assert.strictEqual(epRecord.progressPercent, 60, 'Progress percent should be 60%');
console.log('✓ Progress synced: ' + epRecord.title.title + ' is now at ' + epRecord.progressPercent + '%');

// Complete video (>95%) -> Should be removed from continue watching
db.updateWatchProgress('p-001', 't-001', 'ep-101', 3200, 3240);
const cwCompleted = db.getContinueWatching('p-001');
assert(!cwCompleted.some(c => c.titleId === 't-001'), 'Completed title should be cleared from Continue Watching');
console.log('✓ Completed video automatically removed from Continue Watching (>95% threshold)');

// 5. Full-Text Instant Search
const searchResults = db.search('neon');
assert(searchResults.length > 0, 'Search for "neon" should return results');
assert.strictEqual(searchResults[0].title, 'Neon Vanguard', 'Top result should be Neon Vanguard');
console.log('✓ Search verification: Found "' + searchResults[0].title + '"');

console.log('---------------------------------------------------------');
console.log('ALL INTEGRATION & FUNCTIONAL TESTS PASSED GREEN (100%)');
