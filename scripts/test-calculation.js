const TourStatisticsCalculator = require('./calculate-tour-stats');

/**
 * Test script for validating tour statistics calculation locally
 * Run this before deploying to catch any issues
 */

async function runCalculationTest() {
  console.log("🧪 Running Tour Statistics Calculation Test...");
  console.log(`⏰ Test started at: ${new Date().toISOString()}`);
  
  try {
    // Check environment
    if (!process.env.PHISH_NET_API_KEY) {
      throw new Error("PHISH_NET_API_KEY environment variable is required for testing");
    }
    
    console.log("🔑 API key configured ✅");
    
    // Initialize calculator
    const calculator = new TourStatisticsCalculator(process.env.PHISH_NET_API_KEY);
    console.log("⚙️ Calculator initialized ✅");
    
    // Run calculation with timing
    const startTime = Date.now();
    console.log("🎯 Starting calculation...");
    
    const statistics = await calculator.calculateCurrentTourStatistics();
    
    const calculationTime = Date.now() - startTime;
    console.log(`⏱️ Calculation completed in ${calculationTime}ms`);
    
    // Validate results
    console.log("\n📊 Validating Results:");
    
    // Check required fields
    const requiredFields = ['tourName', 'lastUpdated', 'latestShow', 'longestSongs', 'rarestSongs'];
    for (const field of requiredFields) {
      if (statistics[field] !== undefined && statistics[field] !== null) {
        console.log(`✅ ${field}: ${typeof statistics[field] === 'object' ? JSON.stringify(statistics[field]).substring(0, 50) + '...' : statistics[field]}`);
      } else {
        console.log(`❌ ${field}: MISSING`);
      }
    }
    
    // Check data quality
    console.log("\n🎵 Data Quality:");
    console.log(`   Longest Songs: ${statistics.longestSongs.length}/3`);
    console.log(`   Rarest Songs: ${statistics.rarestSongs.length}/3`);
    
    // Show sample data
    if (statistics.longestSongs.length > 0) {
      console.log(`   Sample Longest: ${statistics.longestSongs[0].songName} (${formatDuration(statistics.longestSongs[0].durationSeconds)})`);
    }
    
    if (statistics.rarestSongs.length > 0) {
      console.log(`   Sample Rarest: ${statistics.rarestSongs[0].songName} (gap: ${statistics.rarestSongs[0].gap})`);
    }
    
    // Performance metrics
    console.log("\n📈 Performance:");
    console.log(`   Calculation Time: ${calculationTime}ms`);
    console.log(`   Target: <30000ms (30 seconds)`);
    console.log(`   Status: ${calculationTime < 30000 ? '✅ PASS' : '⚠️ SLOW'}`);
    
    // JSON size
    const jsonSize = JSON.stringify(statistics).length;
    console.log(`   JSON Size: ${jsonSize} bytes (${Math.round(jsonSize/1024)}KB)`);
    
    console.log("\n✅ Calculation test completed successfully!");
    
    return {
      success: true,
      statistics,
      calculationTime,
      jsonSize
    };
    
  } catch (error) {
    console.error("❌ Calculation test failed:", error.message);
    console.error("🔍 Stack trace:", error.stack);
    
    return {
      success: false,
      error: error.message
    };
  }
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Run test if called directly
if (require.main === module) {
  runCalculationTest()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error("💥 Test runner failed:", error);
      process.exit(1);
    });
}

module.exports = { runCalculationTest };