const fs = require('fs').promises;
const TourStatisticsCalculator = require('./calculate-tour-stats');

/**
 * Main orchestrator script for tour statistics updates
 * This script runs in GitHub Actions on a schedule
 */

async function main() {
  console.log("🚀 PhishQS Tour Statistics Update Starting...");
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  try {
    // Validate environment
    if (!process.env.PHISH_NET_API_KEY) {
      throw new Error("PHISH_NET_API_KEY environment variable is required");
    }
    
    // 1. Check if update is needed (unless forced)
    const forceUpdate = process.env.FORCE_UPDATE === 'true';
    console.log(`🔍 Force update: ${forceUpdate}`);
    
    if (!forceUpdate && !(await shouldUpdate())) {
      console.log("📊 No new shows detected, statistics are current");
      console.log("✅ Update check complete - no action needed");
      return;
    }
    
    console.log("🎯 New show detected or force update requested - calculating fresh statistics...");
    
    // 2. Calculate fresh tour statistics
    const calculator = new TourStatisticsCalculator(process.env.PHISH_NET_API_KEY);
    const startTime = Date.now();
    
    const statistics = await calculator.calculateCurrentTourStatistics();
    
    const calculationTime = Date.now() - startTime;
    console.log(`⏱️ Calculation completed in ${calculationTime}ms`);
    
    // 3. Write JSON endpoint file with pretty formatting
    const jsonContent = JSON.stringify(statistics, null, 2);
    await fs.writeFile('current-tour-stats.json', jsonContent);
    console.log("📄 Updated current-tour-stats.json");
    
    // 4. Update state tracking
    await updateState(statistics, calculationTime);
    
    console.log("✅ Tour statistics update completed successfully!");
    console.log(`📊 Updated: ${statistics.tourName}`);
    console.log(`🎵 Latest show: ${statistics.latestShow}`);
    console.log(`📈 ${statistics.longestSongs.length} longest songs, ${statistics.rarestSongs.length} rarest songs`);
    console.log(`🌐 Endpoint will serve: ${JSON.stringify(statistics).length} bytes`);
    
  } catch (error) {
    console.error("❌ Tour statistics update failed:", error.message);
    console.error("🔍 Stack trace:", error.stack);
    
    // Try to preserve last known good data
    await handleUpdateFailure(error);
    
    process.exit(1);
  }
}

/**
 * Check if we need to update based on latest show vs our last processed show
 */
async function shouldUpdate() {
  try {
    console.log("🔍 Checking if update is needed...");
    
    // Load current state
    const state = await loadState();
    console.log(`📊 Last processed show: ${state.lastProcessedShow || 'none'}`);
    
    // Get latest show date from Phish.net
    const latestShowDate = await getLatestShowDate();
    console.log(`🎵 Latest show from API: ${latestShowDate}`);
    
    // Compare dates
    const needsUpdate = !state.lastProcessedShow || latestShowDate > state.lastProcessedShow;
    console.log(`🎯 Update needed: ${needsUpdate}`);
    
    return needsUpdate;
    
  } catch (error) {
    console.log(`⚠️ Could not determine if update needed: ${error.message}`);
    // When in doubt, update
    return true;
  }
}

/**
 * Get the latest show date from Phish.net
 */
async function getLatestShowDate() {
  const PhishNetClient = require('./phish-net-client');
  const client = new PhishNetClient(process.env.PHISH_NET_API_KEY);
  const latestShow = await client.fetchLatestShow();
  return latestShow.showdate;
}

/**
 * Load current processing state
 */
async function loadState() {
  try {
    const stateData = await fs.readFile('data/state.json', 'utf8');
    return JSON.parse(stateData);
  } catch (error) {
    // State file doesn't exist or is corrupted - return empty state
    console.log("📋 No previous state found, starting fresh");
    return {
      lastProcessedShow: null,
      lastUpdateTime: null,
      processingStatus: 'never-run'
    };
  }
}

/**
 * Update processing state after successful calculation
 */
async function updateState(statistics, calculationTime) {
  const state = {
    lastProcessedShow: statistics.latestShow,
    lastUpdateTime: statistics.lastUpdated,
    processingStatus: 'success',
    calculationTimeMs: calculationTime,
    tourName: statistics.tourName,
    dataQuality: {
      longestSongsCount: statistics.longestSongs.length,
      rarestSongsCount: statistics.rarestSongs.length,
      completeness: calculateCompleteness(statistics)
    }
  };
  
  // Ensure data directory exists
  await fs.mkdir('data', { recursive: true });
  
  // Write updated state
  await fs.writeFile('data/state.json', JSON.stringify(state, null, 2));
  console.log("💾 Updated processing state");
}

/**
 * Handle update failures gracefully
 */
async function handleUpdateFailure(error) {
  console.log("🚨 Handling update failure...");
  
  try {
    // Update state to reflect error
    const state = await loadState();
    state.processingStatus = 'error';
    state.lastError = error.message;
    state.lastErrorTime = new Date().toISOString();
    
    await fs.mkdir('data', { recursive: true });
    await fs.writeFile('data/state.json', JSON.stringify(state, null, 2));
    
    console.log("📊 Error state recorded for monitoring");
    
    // Check if we have a previous good JSON file to preserve
    try {
      const existingJson = await fs.readFile('current-tour-stats.json', 'utf8');
      console.log("📄 Previous JSON file exists, preserving it");
    } catch {
      console.log("⚠️ No previous JSON file to preserve");
    }
    
  } catch (stateError) {
    console.error("❌ Could not save error state:", stateError.message);
  }
}

/**
 * Calculate data completeness percentage
 */
function calculateCompleteness(statistics) {
  let score = 0;
  let maxScore = 0;
  
  // Tour name (required)
  maxScore += 10;
  if (statistics.tourName) score += 10;
  
  // Longest songs (0-3 expected)
  maxScore += 30;
  score += Math.min(statistics.longestSongs.length * 10, 30);
  
  // Rarest songs (0-3 expected)  
  maxScore += 30;
  score += Math.min(statistics.rarestSongs.length * 10, 30);
  
  // Latest show (required)
  maxScore += 10;
  if (statistics.latestShow) score += 10;
  
  // Last updated (required)
  maxScore += 10;
  if (statistics.lastUpdated) score += 10;
  
  // Duration data quality
  maxScore += 10;
  const hasValidDurations = statistics.longestSongs.some(song => song.durationSeconds > 0);
  if (hasValidDurations) score += 10;
  
  return Math.round((score / maxScore) * 100);
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error("💥 Unhandled error:", error);
    process.exit(1);
  });
}

module.exports = { main, shouldUpdate, loadState };