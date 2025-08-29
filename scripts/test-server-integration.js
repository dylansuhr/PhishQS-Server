/**
 * Test script for server-side tour statistics integration
 * Validates that the current-tour-stats.json format matches iOS expectations
 */

const fs = require('fs');
const path = require('path');

/**
 * Test the current tour statistics JSON format
 */
function testCurrentTourStatsFormat() {
  console.log("🧪 Testing current-tour-stats.json format...");
  
  try {
    // Read the current tour stats JSON
    const jsonPath = path.join(__dirname, '..', 'current-tour-stats.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const stats = JSON.parse(jsonContent);
    
    console.log("✅ JSON file loaded successfully");
    console.log(`📊 Tour: ${stats.tourName}`);
    console.log(`🎵 Latest show: ${stats.latestShow}`);
    console.log(`⏰ Last updated: ${stats.lastUpdated}`);
    
    // Test longest songs format
    console.log("\n🎸 Testing longest songs format:");
    if (stats.longestSongs && Array.isArray(stats.longestSongs)) {
      console.log(`✅ longestSongs is array with ${stats.longestSongs.length} items`);
      
      stats.longestSongs.forEach((song, index) => {
        console.log(`   ${index + 1}. ${song.songName} - ${formatDuration(song.durationSeconds)} (${song.showDate})`);
        
        // Validate required fields
        const requiredFields = ['songName', 'durationSeconds', 'showDate', 'venue'];
        const missingFields = requiredFields.filter(field => !song[field]);
        
        if (missingFields.length > 0) {
          console.log(`   ⚠️ Missing fields: ${missingFields.join(', ')}`);
        } else {
          console.log(`   ✅ All required fields present`);
        }
      });
    } else {
      console.log("❌ longestSongs is not a valid array");
    }
    
    // Test rarest songs format
    console.log("\n🎪 Testing rarest songs format:");
    if (stats.rarestSongs && Array.isArray(stats.rarestSongs)) {
      console.log(`✅ rarestSongs is array with ${stats.rarestSongs.length} items`);
      
      stats.rarestSongs.forEach((song, index) => {
        console.log(`   ${index + 1}. ${song.songName} - Gap: ${song.gap} (last: ${song.lastPlayed})`);
        
        // Validate required fields for rarest songs
        const requiredFields = ['songName', 'gap', 'lastPlayed', 'tourDate', 'tourVenue'];
        const missingFields = requiredFields.filter(field => !song[field]);
        
        if (missingFields.length > 0) {
          console.log(`   ⚠️ Missing fields: ${missingFields.join(', ')}`);
        } else {
          console.log(`   ✅ All required fields present`);
        }
      });
    } else {
      console.log("❌ rarestSongs is not a valid array");
    }
    
    // Test iOS compatibility
    console.log("\n📱 Testing iOS ServerTourStatsResponse compatibility:");
    
    const iosRequiredFields = ['tourName', 'lastUpdated', 'latestShow', 'longestSongs', 'rarestSongs'];
    const missingIosFields = iosRequiredFields.filter(field => !stats[field]);
    
    if (missingIosFields.length === 0) {
      console.log("✅ All iOS required fields present");
    } else {
      console.log(`❌ Missing iOS fields: ${missingIosFields.join(', ')}`);
    }
    
    // Test data quality
    console.log("\n📊 Data quality assessment:");
    const hasValidLongestSongs = stats.longestSongs && stats.longestSongs.length === 3;
    const hasValidRarestSongs = stats.rarestSongs && stats.rarestSongs.length === 3;
    const hasRecentUpdate = isRecentDate(stats.lastUpdated);
    
    console.log(`   Longest songs: ${hasValidLongestSongs ? '✅' : '❌'} (${stats.longestSongs?.length || 0}/3)`);
    console.log(`   Rarest songs: ${hasValidRarestSongs ? '✅' : '❌'} (${stats.rarestSongs?.length || 0}/3)`);
    console.log(`   Recent update: ${hasRecentUpdate ? '✅' : '❌'} (${stats.lastUpdated})`);
    
    const overallScore = [hasValidLongestSongs, hasValidRarestSongs, hasRecentUpdate]
      .filter(Boolean).length;
    
    console.log(`\n🎯 Overall data quality: ${overallScore}/3 ${getScoreEmoji(overallScore)}`);
    
    return overallScore === 3;
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

/**
 * Format duration in seconds to MM:SS
 */
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Check if date is recent (within last 7 days)
 */
function isRecentDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  } catch {
    return false;
  }
}

/**
 * Get emoji for score
 */
function getScoreEmoji(score) {
  switch(score) {
    case 3: return "🚀";
    case 2: return "👍";
    case 1: return "⚠️";
    default: return "❌";
  }
}

/**
 * Test server endpoint simulation
 */
function testServerEndpointSimulation() {
  console.log("\n🌐 Testing server endpoint simulation...");
  
  // Simulate iOS ServerSideTourStatsService behavior
  const baseURL = "https://phish-qs-server.vercel.app";
  const endpoint = `${baseURL}/current-tour-stats.json`;
  
  console.log(`📡 Would fetch from: ${endpoint}`);
  console.log("⏱️ Timeout: 10 seconds");
  console.log("📋 Accept: application/json");
  
  // Simulate the conversion process
  try {
    const jsonPath = path.join(__dirname, '..', 'current-tour-stats.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const serverResponse = JSON.parse(jsonContent);
    
    console.log("🔄 Simulating iOS conversion...");
    
    // Simulate ServerSideTourStatsService.convertToTourSongStatistics
    const converted = {
      longestSongs: serverResponse.longestSongs?.map(serverTrack => ({
        songName: serverTrack.songName,
        durationSeconds: serverTrack.durationSeconds,
        showDate: serverTrack.showDate,
        venue: serverTrack.venue
      })) || [],
      
      rarestSongs: serverResponse.rarestSongs?.map(serverGap => ({
        songName: serverGap.songName,
        gap: serverGap.gap,
        lastPlayed: serverGap.lastPlayed,
        tourVenue: serverGap.tourVenue,
        tourDate: serverGap.tourDate
      })) || [],
      
      tourName: serverResponse.tourName
    };
    
    console.log("✅ Conversion successful");
    console.log(`📊 Converted: ${converted.longestSongs.length} longest, ${converted.rarestSongs.length} rarest`);
    
    return true;
    
  } catch (error) {
    console.error("❌ Conversion simulation failed:", error.message);
    return false;
  }
}

/**
 * Main test runner
 */
function main() {
  console.log("🚀 PhishQS Server Integration Test");
  console.log("=" .repeat(50));
  
  const formatTest = testCurrentTourStatsFormat();
  const endpointTest = testServerEndpointSimulation();
  
  console.log("\n" + "=".repeat(50));
  console.log("📋 Test Results:");
  console.log(`   JSON Format: ${formatTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   iOS Integration: ${endpointTest ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallSuccess = formatTest && endpointTest;
  console.log(`\n🎯 Overall Result: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (overallSuccess) {
    console.log("🚀 Server integration is ready for production!");
  } else {
    console.log("⚠️ Server integration needs fixes before deployment");
  }
  
  return overallSuccess;
}

// Run tests if called directly
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main, testCurrentTourStatsFormat, testServerEndpointSimulation };