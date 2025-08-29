/**
 * Test venue extraction logic without requiring API keys
 * This simulates what the server should produce with proper venue extraction
 */

const TourStatisticsCalculator = require('./calculate-tour-stats');

/**
 * Mock Phish.net API responses with realistic venue data structure
 */
function createMockPhishNetClient() {
  return {
    async fetchShowSetlist(showDate) {
      const mockSetlists = {
        "2025-06-24": {
          showdate: "2025-06-24",
          venue: "Petersen Events Center", // This should be extracted properly
          location: "Pittsburgh, PA",
          setlistdata: []
        },
        "2025-07-11": {
          showdate: "2025-07-11",
          venuename: "North Charleston Coliseum", // Alternative field name
          location: "North Charleston, SC", 
          setlistdata: []
        },
        "2025-07-15": {
          showdate: "2025-07-15",
          venue: "TD Pavilion at the Mann",
          location: "Philadelphia, PA",
          setlistdata: []
        }
      };
      
      return mockSetlists[showDate] || { venue: "Unknown Venue" };
    },
    
    async fetchShowsForYear(year) {
      return [
        { showdate: "2025-06-24", venue: "Petersen Events Center" },
        { showdate: "2025-07-11", venuename: "North Charleston Coliseum" }, // Different field
        { showdate: "2025-07-15", venue: "TD Pavilion at the Mann" },
        { showdate: "2025-07-18", venue: "United Center" },
        { showdate: "2025-07-27", venue: "Final Venue" }
      ];
    },
    
    extractSongNames() {
      return ["Test Song"];
    },
    
    async fetchSongGaps() {
      return [];
    }
  };
}

/**
 * Test the enhanced venue extraction logic
 */
async function testVenueExtraction() {
  console.log("🧪 Testing Enhanced Venue Extraction Logic");
  console.log("=" .repeat(50));
  
  // Create calculator with mock client
  const calculator = new TourStatisticsCalculator("mock-api-key");
  calculator.phishNet = createMockPhishNetClient();
  
  // Test venue extraction from different API response formats
  const testCases = [
    {
      name: "Standard venue field",
      response: { venue: "Petersen Events Center", location: "Pittsburgh, PA" },
      expected: "Petersen Events Center"
    },
    {
      name: "Alternative venuename field", 
      response: { venuename: "North Charleston Coliseum", location: "North Charleston, SC" },
      expected: "North Charleston Coliseum"
    },
    {
      name: "Location fallback",
      response: { location: "TD Pavilion at the Mann, Philadelphia, PA" },
      expected: "TD Pavilion at the Mann, Philadelphia, PA"
    },
    {
      name: "No venue data",
      response: { showdate: "2025-01-01", setlist: [] },
      expected: "Unknown Venue"
    }
  ];
  
  console.log("🔍 Testing venue extraction methods:");
  testCases.forEach((testCase, i) => {
    const result = calculator.extractVenue(testCase.response);
    const passed = result === testCase.expected;
    
    console.log(`   ${i+1}. ${testCase.name}: ${passed ? '✅' : '❌'}`);
    console.log(`      Expected: "${testCase.expected}"`);
    console.log(`      Got: "${result}"`);
    
    if (!passed) {
      console.log(`      ⚠️ Test failed - venue extraction needs improvement`);
    }
    console.log("");
  });
}

/**
 * Simulate what the corrected JSON should look like with proper venues
 */
function generateCorrectedTourStats() {
  console.log("🎯 Expected Corrected Tour Statistics JSON:");
  console.log("-" .repeat(40));
  
  const correctedStats = {
    tourName: "Summer Tour 2025",
    lastUpdated: new Date().toISOString(),
    latestShow: "2025-07-27",
    longestSongs: [
      {
        songName: "What's Going Through Your Mind",
        durationSeconds: 2544,
        showDate: "2025-06-24",
        venue: "Petersen Events Center", // Correct venue
        venueRun: { showNumber: 1, totalShows: 1, displayText: "N1/1" }
      },
      {
        songName: "Sand", 
        durationSeconds: 2383,
        showDate: "2025-07-15",
        venue: "TD Pavilion at the Mann", // Correct venue
        venueRun: { showNumber: 1, totalShows: 2, displayText: "N1/2" }
      },
      {
        songName: "Down with Disease",
        durationSeconds: 2048, 
        showDate: "2025-07-11",
        venue: "North Charleston Coliseum", // Correct venue
        venueRun: { showNumber: 1, totalShows: 1, displayText: "N1/1" }
      }
    ],
    rarestSongs: [
      {
        songName: "On Your Way Down",
        gap: 522,
        lastPlayed: "2011-08-06",
        tourDate: "2025-07-18", 
        tourVenue: "United Center" // This one was already correct
      },
      {
        songName: "Paul and Silas",
        gap: 323,
        lastPlayed: "2016-07-22", 
        tourDate: "2025-06-24",
        tourVenue: "Petersen Events Center" // Correct venue
      },
      {
        songName: "Devotion To A Dream",
        gap: 322,
        lastPlayed: "2016-10-15",
        tourDate: "2025-07-11",
        tourVenue: "North Charleston Coliseum" // Correct venue  
      }
    ]
  };
  
  console.log(JSON.stringify(correctedStats, null, 2));
  
  return correctedStats;
}

/**
 * Main test function
 */
async function main() {
  console.log("🔧 PhishQS Venue Extraction Test");
  console.log("Testing enhanced venue extraction without API keys");
  console.log("=" .repeat(60));
  
  await testVenueExtraction();
  
  console.log("=" .repeat(60));
  generateCorrectedTourStats();
  
  console.log("\n" + "=" .repeat(60));
  console.log("🎯 Summary:");
  console.log("✅ Enhanced venue extraction logic implemented");
  console.log("✅ Multiple venue field checking (venue, venuename, location)"); 
  console.log("⏳ Need to run server calculation with actual Phish.net API");
  console.log("⏳ Need to update deployed JSON with calculated results");
  
  console.log("\n📋 Next Steps:");
  console.log("1. Set up PHISH_NET_API_KEY environment variable");
  console.log("2. Run server calculation to generate correct venue data"); 
  console.log("3. Deploy updated JSON with actual API-sourced venue names");
  console.log("4. Test iOS app shows correct venues");
}

module.exports = { main, testVenueExtraction, generateCorrectedTourStats };

// Run test if called directly
if (require.main === module) {
  main();
}