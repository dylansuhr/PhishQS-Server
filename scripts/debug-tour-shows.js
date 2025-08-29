/**
 * Debug script to understand which shows server finds vs what it should find
 */

/**
 * Based on the correct results, these songs should be in Summer Tour 2025:
 * - Paul and Silas played on 6/24/25 (gap 323)
 * - Devotion To A Dream played on 7/11/25 (gap 322)  
 * - On Your Way Down played on 7/18/25 (gap 522)
 */

/**
 * Known Summer Tour 2025 shows (based on correct results)
 * This is what the server should be finding
 */
const EXPECTED_SUMMER_TOUR_SHOWS = [
  "2025-06-24", // Paul and Silas
  "2025-07-11", // Devotion To A Dream 
  "2025-07-18", // On Your Way Down
  // ... other Summer Tour shows
  "2025-07-27"  // Latest show
];

/**
 * Expected songs that should appear in Summer Tour calculation
 */
const EXPECTED_TOUR_SONGS = [
  { name: "Paul and Silas", date: "2025-06-24", expectedGap: 323 },
  { name: "Devotion To A Dream", date: "2025-07-11", expectedGap: 322 },
  { name: "On Your Way Down", date: "2025-07-18", expectedGap: 522 }
];

/**
 * Debug the current server tour show detection
 */
function debugTourShowDetection() {
  console.log("🔍 Debug: Tour Show Detection Logic");
  console.log("=" .repeat(50));
  
  console.log("📋 Expected Summer Tour 2025 Shows:");
  EXPECTED_SUMMER_TOUR_SHOWS.forEach(date => {
    console.log(`   ${date}`);
  });
  
  console.log("\n🎯 Expected Tour Songs:");
  EXPECTED_TOUR_SONGS.forEach(song => {
    console.log(`   ${song.name} on ${song.date} (gap: ${song.expectedGap})`);
  });
  
  console.log("\n🚨 Current Server Problem:");
  console.log("   Server uses: fetchShowsForYear(2025) - gets ALL 2025 shows");
  console.log("   Should use: Only Summer Tour 2025 shows (June-July range)");
  
  console.log("\n💡 Potential Issues:");
  console.log("   1. Server includes non-Summer Tour shows in calculation");
  console.log("   2. Server may be missing specific Summer Tour shows");
  console.log("   3. Song filtering doesn't match iOS tour identification");
  
  console.log("\n🔧 Fix Strategy:");
  console.log("   1. Narrow date range to Summer Tour period");
  console.log("   2. Verify server finds Paul and Silas on 6/24/25");
  console.log("   3. Verify server finds Devotion To A Dream on 7/11/25");
  console.log("   4. Ensure gap calculations match iOS");
}

/**
 * Test the date range that should be used for Summer Tour 2025
 */
function testSummerTourDateRange() {
  console.log("\n📅 Summer Tour 2025 Date Range Analysis:");
  console.log("-" .repeat(40));
  
  // Based on the expected results, Summer Tour 2025 runs from 6/24 to 7/27
  const tourStart = "2025-06-24"; // Paul and Silas date
  const tourEnd = "2025-07-27";   // Latest show date
  
  console.log(`🎯 Estimated Summer Tour Range: ${tourStart} to ${tourEnd}`);
  console.log("   This covers the period where our expected songs appear");
  
  console.log("\n📊 Key Songs in This Range:");
  EXPECTED_TOUR_SONGS.forEach(song => {
    const inRange = song.date >= tourStart && song.date <= tourEnd;
    console.log(`   ${song.name} (${song.date}): ${inRange ? '✅ In Range' : '❌ Outside Range'}`);
  });
  
  console.log("\n🔧 Recommended Server Fix:");
  console.log("   Replace: yearShows.filter(show => show.showdate <= latestShowDate)");
  console.log("   With:    yearShows.filter(show => show.showdate >= '2025-06-24' && show.showdate <= latestShowDate)");
}

/**
 * Debug why server finds wrong songs
 */
function debugWrongSongDetection() {
  console.log("\n🎪 Wrong Song Detection Analysis:");
  console.log("-" .repeat(40));
  
  console.log("❌ Server Currently Finds:");
  console.log("   2. Destiny Unbound (445 gap) - played on 7/21/25");
  console.log("   3. Walfredo (391 gap) - played on 7/25/25");
  
  console.log("\n✅ Server Should Find:");
  console.log("   2. Paul and Silas (323 gap) - played on 6/24/25");  
  console.log("   3. Devotion To A Dream (322 gap) - played on 7/11/25");
  
  console.log("\n🔍 Analysis:");
  console.log("   • Server IS finding high-gap songs from the tour period");
  console.log("   • But it's missing the specific songs iOS finds");
  console.log("   • This suggests Paul and Silas & Devotion To A Dream have either:");
  console.log("     1. Different calculated gaps than expected");
  console.log("     2. Not being detected in the tour shows");
  console.log("     3. Gap calculation errors");
  
  console.log("\n🎯 Next Debug Steps:");
  console.log("   1. Verify 6/24/25 and 7/11/25 are in server's tour show list");
  console.log("   2. Check if Paul and Silas appears in 6/24/25 setlist");
  console.log("   3. Check if Devotion To A Dream appears in 7/11/25 setlist");
  console.log("   4. Verify gap calculations for these specific songs");
}

/**
 * Main debug function
 */
function main() {
  console.log("🐛 PhishQS Tour Show Detection Debug");
  console.log("Identifying why server finds wrong songs");
  console.log("=" .repeat(60));
  
  debugTourShowDetection();
  testSummerTourDateRange();
  debugWrongSongDetection();
  
  console.log("\n" + "=" .repeat(60));
  console.log("🎯 Priority Actions:");
  console.log("1. Fix fetchAllTourShows to use proper Summer Tour date range");
  console.log("2. Add logging to see which shows server actually processes");
  console.log("3. Verify Paul and Silas & Devotion To A Dream appear in setlists");
  console.log("4. Debug gap calculations for these specific songs");
}

module.exports = { main, EXPECTED_SUMMER_TOUR_SHOWS, EXPECTED_TOUR_SONGS };

// Run debug if called directly
if (require.main === module) {
  main();
}