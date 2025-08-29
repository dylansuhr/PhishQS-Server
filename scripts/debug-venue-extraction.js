/**
 * Debug script to understand Phish.net API response structure for venue extraction
 * This helps us fix the venue naming issues without hardcoding
 */

/**
 * Mock Phish.net API response structure to understand how venues should be extracted
 * This represents what we expect the actual API to return
 */
function getMockPhishNetResponses() {
  return {
    // Mock response for fetchShowsForYear - used to get show list
    yearShowsResponse: {
      data: [
        {
          showdate: "2025-06-24",
          venue: "Petersen Events Center", // This might be incomplete
          venuename: "Petersen Events Center", // Alternative field?
          location: "Pittsburgh, PA"
        },
        {
          showdate: "2025-07-11", 
          venue: "North Charleston Coliseum",
          venuename: "North Charleston Coliseum",
          location: "North Charleston, SC"
        },
        {
          showdate: "2025-07-15",
          venue: "TD Pavilion at the Mann", 
          venuename: "TD Pavilion at the Mann",
          location: "Philadelphia, PA"
        }
      ]
    },
    
    // Mock response for fetchShowSetlist - used to get individual show details
    setlistResponse: {
      showdate: "2025-06-24",
      venue: "Petersen Events Center", // Venue in setlist response
      venuename: "Petersen Events Center", // Alternative field?
      location: "Pittsburgh, PA",
      setlistdata: [
        // ... setlist data
      ]
    }
  };
}

/**
 * Debug venue extraction from different response formats
 */
function debugVenueExtraction() {
  console.log("🔍 Debug: Phish.net Venue Extraction");
  console.log("=" .repeat(50));
  
  const mockData = getMockPhishNetResponses();
  
  console.log("📊 Expected Venue Names for Summer Tour 2025:");
  console.log("   6/24/25 - Petersen Events Center (Pittsburgh, PA)");
  console.log("   7/11/25 - North Charleston Coliseum (North Charleston, SC)"); 
  console.log("   7/15/25 - TD Pavilion at the Mann (Philadelphia, PA)");
  
  console.log("\n🔍 Testing Year Shows Response Venue Extraction:");
  mockData.yearShowsResponse.data.forEach(show => {
    console.log(`   ${show.showdate}:`);
    console.log(`     show.venue: "${show.venue || 'undefined'}"`);
    console.log(`     show.venuename: "${show.venuename || 'undefined'}"`);
    console.log(`     show.location: "${show.location || 'undefined'}"`);
    
    // Test different extraction strategies
    const venueOption1 = show.venue || show.venuename;
    const venueOption2 = show.venuename || show.venue;
    const fallback = show.venue || show.venuename || "Unknown Venue";
    
    console.log(`     Strategy 1 (venue || venuename): "${venueOption1}"`);
    console.log(`     Strategy 2 (venuename || venue): "${venueOption2}"`);
    console.log(`     Fallback: "${fallback}"`);
    console.log("");
  });
  
  console.log("🔍 Testing Setlist Response Venue Extraction:");
  const setlist = mockData.setlistResponse;
  console.log(`   ${setlist.showdate}:`);
  console.log(`     setlist.venue: "${setlist.venue || 'undefined'}"`);
  console.log(`     setlist.venuename: "${setlist.venuename || 'undefined'}"`);
  console.log(`     setlist.location: "${setlist.location || 'undefined'}"`);
}

/**
 * Test the current server venue extraction logic
 */
function testCurrentServerLogic() {
  console.log("\n🛠️ Current Server Logic Issues:");
  console.log("-" .repeat(40));
  
  console.log("❌ Problem 1: Server uses show.venue from year-based API call");
  console.log("   - Year-based API might have incomplete venue data");
  console.log("   - Individual setlist API calls might have better venue data");
  
  console.log("\n❌ Problem 2: Fallback to 'Unknown Venue' too quickly");
  console.log("   - Need to try multiple venue field extractions");
  console.log("   - Should try: venue, venuename, location fields");
  
  console.log("\n❌ Problem 3: Not using setlist response venue data effectively");
  console.log("   - Server fetches setlist but doesn't extract venue from it properly");
  console.log("   - Line 147: actualVenue = setlist.venue || show.venue || 'Unknown Venue'");
  
  console.log("\n💡 Solutions:");
  console.log("   1. Improve venue field extraction from API responses");
  console.log("   2. Use setlist response as primary venue source");
  console.log("   3. Add comprehensive field checking (venue, venuename, etc.)");
  console.log("   4. Log actual API response structure to debug");
}

/**
 * Recommend venue extraction fixes
 */
function recommendVenueFixes() {
  console.log("\n🔧 Recommended Server Fixes:");
  console.log("-" .repeat(40));
  
  console.log("1. Enhanced venue extraction function:");
  console.log(`
function extractVenue(apiResponse) {
  // Try multiple possible venue fields
  return apiResponse.venue || 
         apiResponse.venuename || 
         apiResponse.venue_name ||
         apiResponse.location ||
         'Unknown Venue';
}
  `);
  
  console.log("2. Use setlist response as primary venue source:");
  console.log(`
// In calculateRarestSongs method:
const setlist = await this.phishNet.fetchShowSetlist(show.showdate);
const actualVenue = extractVenue(setlist); // Use setlist venue data
  `);
  
  console.log("3. Add API response logging to debug:");
  console.log(`
console.log('📋 Setlist API response venue fields:', {
  venue: setlist.venue,
  venuename: setlist.venuename, 
  location: setlist.location
});
  `);
}

/**
 * Main debug function
 */
function main() {
  console.log("🔧 PhishQS Venue Extraction Debug");
  console.log("Fixing 'Unknown Venue' issues in server responses");
  console.log("=" .repeat(60));
  
  debugVenueExtraction();
  testCurrentServerLogic();
  recommendVenueFixes();
  
  console.log("\n" + "=" .repeat(60));
  console.log("🎯 Next Steps:");
  console.log("1. Update server venue extraction logic with enhanced field checking");
  console.log("2. Use setlist API response as primary venue source");  
  console.log("3. Test with actual API responses (need API key)");
  console.log("4. Remove hardcoded venue names");
  console.log("5. Verify correct venues appear in app");
}

module.exports = { main, debugVenueExtraction, getMockPhishNetResponses };

// Run debug if called directly
if (require.main === module) {
  main();
}