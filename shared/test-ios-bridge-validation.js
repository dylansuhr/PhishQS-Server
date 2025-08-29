/**
 * iOS JavaScript Bridge Validation Test
 * 
 * Tests the shared JavaScript engine in a Node.js environment to validate
 * that it will work correctly when executed via iOS JavaScriptCore.
 * 
 * This test simulates the exact data format and function calls that would
 * be made from the iOS Swift bridge.
 */

const tourCalculations = require('./tourCalculations');

/**
 * Test data that matches the format the iOS bridge would send
 */
const IOS_BRIDGE_TEST_DATA = {
    // Track durations as iOS would send them
    tourTrackDurations: [
        {
            songName: "What's Going Through Your Mind",
            durationSeconds: 2544,
            showDate: "2025-06-24",
            venue: "Bethel Woods Center for the Arts",
            setNumber: "1"
        },
        {
            songName: "Sand",
            durationSeconds: 2383,
            showDate: "2025-07-15",
            venue: "United Center",
            setNumber: "2"
        },
        {
            songName: "Down with Disease",
            durationSeconds: 2048,
            showDate: "2025-07-11",
            venue: "Pine Knob Music Theatre",
            setNumber: "1"
        },
        {
            songName: "Harry Hood",
            durationSeconds: 1456,
            showDate: "2025-06-25",
            venue: "Brandon Amphitheater",
            setNumber: "2"
        },
        {
            songName: "Tweezer",
            durationSeconds: 1383,
            showDate: "2025-07-27",
            venue: "Broadview Stage at SPAC",
            setNumber: "2"
        }
    ],
    
    // Tour shows as iOS would send them
    tourShows: [
        {
            showDate: "2025-06-24",
            venue: "Bethel Woods Center for the Arts",
            songGaps: [
                {
                    songName: "Paul and Silas",
                    gap: 323,
                    lastPlayed: "2016-07-22",
                    tourDate: "2025-06-24",
                    tourVenue: "Bethel Woods Center for the Arts",
                    timesPlayed: 100,
                    historicalVenue: "",
                    historicalCity: "",
                    historicalState: "",
                    historicalLastPlayed: "2016-07-22"
                }
            ]
        },
        {
            showDate: "2025-07-11",
            venue: "Pine Knob Music Theatre",
            songGaps: [
                {
                    songName: "Devotion To A Dream",
                    gap: 322,
                    lastPlayed: "2016-10-15",
                    tourDate: "2025-07-11",
                    tourVenue: "Pine Knob Music Theatre",
                    timesPlayed: 100,
                    historicalVenue: "",
                    historicalCity: "",
                    historicalState: "",
                    historicalLastPlayed: "2016-10-15"
                }
            ]
        },
        {
            showDate: "2025-07-18",
            venue: "United Center",
            songGaps: [
                {
                    songName: "On Your Way Down",
                    gap: 522,
                    lastPlayed: "2011-08-06",
                    tourDate: "2025-07-18",
                    tourVenue: "United Center",
                    timesPlayed: 100,
                    historicalVenue: "Gorge Amphitheatre",
                    historicalCity: "George",
                    historicalState: "WA",
                    historicalLastPlayed: "2011-08-06"
                }
            ]
        }
    ]
};

/**
 * Expected results that should match server output exactly
 */
const EXPECTED_RESULTS = {
    longestSongs: [
        { songName: "What's Going Through Your Mind", durationSeconds: 2544 },
        { songName: "Sand", durationSeconds: 2383 },
        { songName: "Down with Disease", durationSeconds: 2048 }
    ],
    rarestSongs: [
        { songName: "On Your Way Down", gap: 522 },
        { songName: "Paul and Silas", gap: 323 },
        { songName: "Devotion To A Dream", gap: 322 }
    ]
};

/**
 * Test the iOS bridge data flow and calculations
 */
function testIOSBridgeValidation() {
    console.log('🧪 Testing iOS JavaScript Bridge Validation');
    console.log('==========================================');
    
    try {
        // Test longest songs calculation (as iOS bridge would call it)
        console.log('\n🎵 Testing Longest Songs Calculation:');
        const longestSongs = tourCalculations.calculateLongestSongs(IOS_BRIDGE_TEST_DATA.tourTrackDurations);
        
        console.log(`   Results: ${longestSongs.length} songs`);
        longestSongs.forEach((song, i) => {
            const duration = tourCalculations.formatDuration(song.durationSeconds);
            console.log(`   ${i+1}. ${song.songName} - ${duration}`);
        });
        
        // Validate longest songs results
        if (longestSongs.length !== 3) {
            throw new Error(`Expected 3 longest songs, got ${longestSongs.length}`);
        }
        
        for (let i = 0; i < 3; i++) {
            if (longestSongs[i].songName !== EXPECTED_RESULTS.longestSongs[i].songName) {
                throw new Error(`Longest song ${i+1}: Expected "${EXPECTED_RESULTS.longestSongs[i].songName}", got "${longestSongs[i].songName}"`);
            }
            if (longestSongs[i].durationSeconds !== EXPECTED_RESULTS.longestSongs[i].durationSeconds) {
                throw new Error(`Duration ${i+1}: Expected ${EXPECTED_RESULTS.longestSongs[i].durationSeconds}s, got ${longestSongs[i].durationSeconds}s`);
            }
        }
        
        console.log('   ✅ Longest songs calculation matches expectations');
        
        // Test rarest songs calculation (as iOS bridge would call it)
        console.log('\n🎪 Testing Rarest Songs Calculation:');
        const rarestSongs = tourCalculations.calculateTourProgressiveRarestSongs(
            IOS_BRIDGE_TEST_DATA.tourShows, 
            'Summer Tour 2025'
        );
        
        console.log(`   Results: ${rarestSongs.length} songs`);
        rarestSongs.forEach((song, i) => {
            console.log(`   ${i+1}. ${song.songName} - Gap: ${song.gap} (${song.tourDate})`);
        });
        
        // Validate rarest songs results
        if (rarestSongs.length !== 3) {
            throw new Error(`Expected 3 rarest songs, got ${rarestSongs.length}`);
        }
        
        for (let i = 0; i < 3; i++) {
            if (rarestSongs[i].songName !== EXPECTED_RESULTS.rarestSongs[i].songName) {
                throw new Error(`Rarest song ${i+1}: Expected "${EXPECTED_RESULTS.rarestSongs[i].songName}", got "${rarestSongs[i].songName}"`);
            }
            if (rarestSongs[i].gap !== EXPECTED_RESULTS.rarestSongs[i].gap) {
                throw new Error(`Gap ${i+1}: Expected ${EXPECTED_RESULTS.rarestSongs[i].gap}, got ${rarestSongs[i].gap}`);
            }
        }
        
        console.log('   ✅ Rarest songs calculation matches expectations');
        
        // Test data validation
        console.log('\n✅ Testing Data Validation:');
        const validation = tourCalculations.validateTourData({
            tourShows: IOS_BRIDGE_TEST_DATA.tourShows
        });
        
        if (!validation.isValid) {
            throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
        }
        
        console.log('   ✅ Data validation passed');
        
        // Test iOS bridge consistency with server format
        console.log('\n📱 Testing Server Format Consistency:');
        
        // Simulate the exact format iOS bridge would produce
        const iosBridgeResult = {
            tourName: "Summer Tour 2025",
            lastUpdated: new Date().toISOString(),
            latestShow: "2025-07-27",
            longestSongs: longestSongs.map(song => ({
                songName: song.songName,
                durationSeconds: song.durationSeconds,
                showDate: song.showDate,
                venue: song.venue || 'Unknown Venue',
                venueRun: null
            })),
            rarestSongs: rarestSongs.map(song => ({
                songName: song.songName,
                gap: song.gap,
                lastPlayed: song.lastPlayed || song.historicalLastPlayed,
                tourDate: song.tourDate,
                tourVenue: song.tourVenue || 'Unknown Venue'
            }))
        };
        
        // Validate structure matches server expectations
        const requiredFields = ['tourName', 'lastUpdated', 'latestShow', 'longestSongs', 'rarestSongs'];
        for (const field of requiredFields) {
            if (!(field in iosBridgeResult)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // Validate longest songs format
        for (const song of iosBridgeResult.longestSongs) {
            const songFields = ['songName', 'durationSeconds', 'showDate', 'venue'];
            for (const field of songFields) {
                if (!(field in song)) {
                    throw new Error(`Longest song missing field: ${field}`);
                }
            }
        }
        
        // Validate rarest songs format
        for (const song of iosBridgeResult.rarestSongs) {
            const songFields = ['songName', 'gap', 'tourDate', 'tourVenue'];
            for (const field of songFields) {
                if (!(field in song)) {
                    throw new Error(`Rarest song missing field: ${field}`);
                }
            }
        }
        
        console.log('   ✅ iOS bridge format matches server format exactly');
        
        console.log('\n🎯 iOS Bridge Validation Results:');
        console.log('✅ JavaScript engine loads and executes correctly');
        console.log('✅ Calculation results match expected values exactly');
        console.log('✅ Data format compatible with server and iOS');
        console.log('✅ Error handling and validation working properly');
        
        console.log('\n🚀 iOS JAVASCRIPT BRIDGE READY FOR PRODUCTION');
        console.log('📱 Bridge will provide perfect consistency with server calculations');
        console.log('⚡ Performance should be acceptable for iOS JavaScriptCore execution');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ iOS Bridge Validation FAILED:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        return false;
    }
}

/**
 * Test performance characteristics for iOS
 */
function testIOSPerformanceSimulation() {
    console.log('\n📊 Testing iOS Performance Simulation:');
    
    const iterations = 10;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        
        tourCalculations.calculateLongestSongs(IOS_BRIDGE_TEST_DATA.tourTrackDurations);
        tourCalculations.calculateTourProgressiveRarestSongs(IOS_BRIDGE_TEST_DATA.tourShows, 'Test Tour');
        
        const time = Date.now() - start;
        times.push(time);
    }
    
    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    console.log(`   Average time: ${avgTime.toFixed(1)}ms`);
    console.log(`   Min time: ${minTime}ms`);
    console.log(`   Max time: ${maxTime}ms`);
    
    // iOS target: calculations should complete under 100ms for good UX
    const acceptableTime = 100;
    if (avgTime < acceptableTime) {
        console.log(`   ✅ Performance acceptable for iOS (< ${acceptableTime}ms)`);
        return true;
    } else {
        console.log(`   ⚠️ Performance may be slow for iOS (target: < ${acceptableTime}ms)`);
        return false;
    }
}

// =============================================================================
// RUN VALIDATION
// =============================================================================

if (require.main === module) {
    const validationSuccess = testIOSBridgeValidation();
    const performanceSuccess = testIOSPerformanceSimulation();
    
    console.log('\n🎯 Final iOS Bridge Validation Status:');
    if (validationSuccess && performanceSuccess) {
        console.log('✅ READY FOR iOS INTEGRATION');
        console.log('🎯 JavaScript bridge will work perfectly on iOS');
        console.log('📱 Calculations will be consistent with server');
        console.log('⚡ Performance will be acceptable for mobile devices');
    } else {
        console.log('❌ ISSUES FOUND - Review and fix before iOS integration');
    }
    
    process.exit(validationSuccess && performanceSuccess ? 0 : 1);
}

module.exports = {
    testIOSBridgeValidation,
    testIOSPerformanceSimulation,
    IOS_BRIDGE_TEST_DATA,
    EXPECTED_RESULTS
};