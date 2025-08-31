const fetch = require('node-fetch');
const fs = require('fs').promises;

/**
 * Health check script for monitoring system status
 */

async function runHealthCheck() {
  console.log("🔍 Running PhishQS Server Health Check...");
  console.log(`⏰ Check started at: ${new Date().toISOString()}`);
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    overallStatus: 'unknown'
  };
  
  // Run all health checks
  const checks = [
    () => checkAPIConnectivity(),
    () => checkJSONStructure(),
    () => checkDataFreshness(),
    () => checkEndpointAvailability()
  ];
  
  for (const check of checks) {
    try {
      const result = await check();
      results.checks.push(result);
      console.log(`${result.status === 'pass' ? '✅' : '❌'} ${result.name}: ${result.status}`);
      if (result.details) console.log(`   ${result.details}`);
    } catch (error) {
      results.checks.push({
        name: 'Unknown Check',
        status: 'fail',
        error: error.message
      });
      console.log(`❌ Check failed: ${error.message}`);
    }
  }
  
  // Calculate overall status
  const failedChecks = results.checks.filter(c => c.status === 'fail').length;
  results.overallStatus = failedChecks === 0 ? 'healthy' : failedChecks < results.checks.length ? 'degraded' : 'unhealthy';
  
  console.log(`\n📊 Health Check Summary:`);
  console.log(`   Overall Status: ${results.overallStatus.toUpperCase()}`);
  console.log(`   Passed: ${results.checks.filter(c => c.status === 'pass').length}`);
  console.log(`   Failed: ${failedChecks}`);
  console.log(`   Total: ${results.checks.length}`);
  
  // Save results for monitoring
  await saveHealthResults(results);
  
  return results;
}

async function checkAPIConnectivity() {
  const check = { name: 'API Connectivity', status: 'unknown' };
  
  try {
    if (!process.env.PHISH_NET_API_KEY) {
      throw new Error('PHISH_NET_API_KEY not configured');
    }
    
    // Test Phish.net API
    const phishNetURL = `https://api.phish.net/v5/setlists/recent.json?apikey=${process.env.PHISH_NET_API_KEY}&limit=1&artist=phish`;
    const phishNetResponse = await fetch(phishNetURL);
    
    if (!phishNetResponse.ok) {
      throw new Error(`Phish.net API returned ${phishNetResponse.status}`);
    }
    
    // Test Phish.in API
    const phishInURL = 'https://api.phish.in/v2/shows?per_page=1';
    const phishInResponse = await fetch(phishInURL);
    
    if (!phishInResponse.ok) {
      throw new Error(`Phish.in API returned ${phishInResponse.status}`);
    }
    
    check.status = 'pass';
    check.details = 'Both Phish.net and Phish.in APIs are responding';
    
  } catch (error) {
    check.status = 'fail';
    check.error = error.message;
  }
  
  return check;
}

async function checkJSONStructure() {
  const check = { name: 'JSON Structure Validation', status: 'unknown' };
  
  try {
    const jsonContent = await fs.readFile('current-tour-stats.json', 'utf8');
    const data = JSON.parse(jsonContent);
    
    // Validate required fields
    const requiredFields = ['tourName', 'lastUpdated', 'latestShow', 'longestSongs', 'rarestSongs'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate array structures
    if (!Array.isArray(data.longestSongs) || !Array.isArray(data.rarestSongs)) {
      throw new Error('longestSongs and rarestSongs must be arrays');
    }
    
    check.status = 'pass';
    check.details = `JSON valid with ${data.longestSongs.length} longest songs, ${data.rarestSongs.length} rarest songs`;
    
  } catch (error) {
    check.status = 'fail';
    check.error = error.message;
  }
  
  return check;
}

async function checkDataFreshness() {
  const check = { name: 'Data Freshness', status: 'unknown' };
  
  try {
    const jsonContent = await fs.readFile('current-tour-stats.json', 'utf8');
    const data = JSON.parse(jsonContent);
    
    const lastUpdated = new Date(data.lastUpdated);
    const now = new Date();
    const ageHours = (now - lastUpdated) / (1000 * 60 * 60);
    
    if (ageHours > 24) {
      check.status = 'fail';
      check.error = `Data is ${Math.round(ageHours)} hours old (over 24 hour threshold)`;
    } else if (ageHours > 12) {
      check.status = 'warn';
      check.details = `Data is ${Math.round(ageHours)} hours old (approaching 24 hour threshold)`;
    } else {
      check.status = 'pass';
      check.details = `Data is ${Math.round(ageHours)} hours old (fresh)`;
    }
    
  } catch (error) {
    check.status = 'fail';
    check.error = error.message;
  }
  
  return check;
}

async function checkEndpointAvailability() {
  const check = { name: 'Endpoint Availability', status: 'unknown' };
  
  try {
    // This would test the GitHub Pages endpoint once it's deployed
    // For now, just verify the JSON file exists and is readable
    await fs.access('current-tour-stats.json');
    
    const stats = await fs.stat('current-tour-stats.json');
    const sizeKB = Math.round(stats.size / 1024);
    
    check.status = 'pass';
    check.details = `JSON endpoint file ready (${sizeKB}KB)`;
    
  } catch (error) {
    check.status = 'fail';
    check.error = error.message;
  }
  
  return check;
}

async function saveHealthResults(results) {
  try {
    await fs.mkdir('data', { recursive: true });
    await fs.writeFile('data/health-check.json', JSON.stringify(results, null, 2));
    console.log("💾 Health check results saved");
  } catch (error) {
    console.log(`⚠️ Could not save health results: ${error.message}`);
  }
}

// Run health check if called directly
if (require.main === module) {
  runHealthCheck()
    .then(results => {
      process.exit(results.overallStatus === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error("💥 Health check failed:", error);
      process.exit(1);
    });
}

module.exports = { runHealthCheck };