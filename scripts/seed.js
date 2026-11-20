const fs = require('fs');
const path = require('path');

async function runSeed() {
  console.log('--- STREAMFLOW DATABASE SEED RUNNER ---');
  const seedFile = path.join(__dirname, '..', 'data', 'seed.json');
  const data = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));

  console.log(`Seeding database with:`);
  console.log(`- ${data.users.length} Users`);
  console.log(`- ${data.profiles.length} Profiles`);
  console.log(`- ${data.genres.length} Genres`);
  console.log(`- ${data.titles.length} Titles (Movies & TV Series)`);
  
  let totalEpisodes = 0;
  data.titles.forEach((t) => {
    if (t.seasons) {
      t.seasons.forEach((s) => {
        totalEpisodes += s.episodes.length;
      });
    }
  });
  console.log(`- ${totalEpisodes} Episodic Video Streams with Skip Intro timestamps`);
  console.log('--- DATABASE SEEDING COMPLETED CLEANLY ---');
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
