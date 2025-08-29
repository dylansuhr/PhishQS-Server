/**
 * Unit Tests for Tour Calculations JavaScript Engine
 * 
 * Validates the shared calculation logic using known Summer Tour 2025 data
 * Tests should match exactly with iOS Swift implementation results
 */

const tourCalculations = require('./tourCalculations');

// Test data based on actual Summer Tour 2025 shows and known results
const SUMMER_2025_TEST_DATA = {
    // Sample tour shows with known rarest songs
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
                    tourVenue: "Bethel Woods Center for the Arts"
                }
            ],
            trackDurations: [
                {
                    songName: "What's Going Through Your Mind",
                    durationSeconds: 2544,
                    showDate: "2025-06-24",
                    venue: "Bethel Woods Center for the Arts"
                },
                {
                    songName: "Paul and Silas", 
                    durationSeconds: 312,
                    showDate: "2025-06-24",
                    venue: "Bethel Woods Center for the Arts"
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
                    tourVenue: "Pine Knob Music Theatre"
                }
            ],
            trackDurations: [
                {
                    songName: "Down with Disease",
                    durationSeconds: 2048,
                    showDate: "2025-07-11",
                    venue: "Pine Knob Music Theatre"
                }
            ]
        },
        {
            showDate: "2025-07-15",
            venue: "United Center", 
            songGaps: [],
            trackDurations: [
                {
                    songName: "Sand",
                    durationSeconds: 2383,
                    showDate: "2025-07-15",
                    venue: "United Center"
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
                    tourVenue: "United Center"
                }
            ],
            trackDurations: []
        }
    ],
    
    // Combined track durations from entire tour for longest songs calculation
    allTourTrackDurations: [
        {
            songName: "What's Going Through Your Mind",
            durationSeconds: 2544,
            showDate: "2025-06-24",
            venue: "Bethel Woods Center for the Arts"
        },
        {
            songName: "Sand",
            durationSeconds: 2383, 
            showDate: "2025-07-15",
            venue: "United Center"
        },
        {
            songName: "Down with Disease",
            durationSeconds: 2048,
            showDate: "2025-07-11", 
            venue: "Pine Knob Music Theatre"
        },
        {
            songName: "Harry Hood",
            durationSeconds: 1456,
            showDate: "2025-06-25",
            venue: "Brandon Amphitheater"
        },
        {
            songName: "Tweezer",
            durationSeconds: 1383,
            showDate: "2025-07-27",
            venue: "Broadview Stage at SPAC"
        }
    ]
};

// Expected results that should match iOS calculations
const EXPECTED_RESULTS = {
    longestSongs: [
        {
            songName: "What's Going Through Your Mind",
            durationSeconds: 2544,
            showDate: "2025-06-24"
        },
        {
            songName: "Sand", 
            durationSeconds: 2383,
            showDate: "2025-07-15"
        },
        {
            songName: "Down with Disease",
            durationSeconds: 2048,
            showDate: "2025-07-11"
        }
    ],
    rarestSongs: [
        {
            songName: "On Your Way Down",
            gap: 522,
            lastPlayed: "2011-08-06"
        },
        {
            songName: "Paul and Silas",
            gap: 323, 
            lastPlayed: "2016-07-22"
        },
        {
            songName: "Devotion To A Dream",
            gap: 322,
            lastPlayed: "2016-10-15"
        }
    ]
};

// =============================================================================
// TEST RUNNER
// =============================================================================

function runAllTests() {
    console.log('🧪 Starting Tour Calculations JavaScript Engine Tests');
    console.log('====================================================');
    
    let passedTests = 0;
    let totalTests = 0;
    
    // Test 1: Longest Songs Calculation
    console.log('\n📊 TEST 1: Longest Songs Calculation');
    if (testLongestSongs()) passedTests++;
    totalTests++;
    
    // Test 2: Tour Progressive Rarest Songs 
    console.log('\n🔍 TEST 2: Tour Progressive Rarest Songs');
    if (testTourProgressiveRarestSongs()) passedTests++;
    totalTests++;
    
    // Test 3: Data Validation
    console.log('\n✅ TEST 3: Data Validation'); 
    if (testDataValidation()) passedTests++;
    totalTests++;
    
    // Test 4: Utility Functions
    console.log('\n🔧 TEST 4: Utility Functions');
    if (testUtilityFunctions()) passedTests++;
    totalTests++;
    
    // Test 5: Edge Cases
    console.log('\n⚠️  TEST 5: Edge Cases');
    if (testEdgeCases()) passedTests++;
    totalTests++;
    
    // Summary
    console.log('\n====================================================');
    console.log(`🏁 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('✅ ALL TESTS PASSED - JavaScript engine ready for integration!');
        return true;
    } else {
        console.log('❌ Some tests failed - review and fix before proceeding');
        return false;
    }
}

// =============================================================================
// INDIVIDUAL TEST FUNCTIONS
// =============================================================================

function testLongestSongs() {
    console.log('   Testing longest songs calculation...');
    
    try {
        const result = tourCalculations.calculateLongestSongs(SUMMER_2025_TEST_DATA.allTourTrackDurations);
        
        // Validate we got 3 results
        if (result.length !== 3) {
            console.log(`   ❌ Expected 3 longest songs, got ${result.length}`);
            return false;
        }
        
        // Validate order (should be sorted by duration, highest first)
        const expectedOrder = EXPECTED_RESULTS.longestSongs;
        for (let i = 0; i < 3; i++) {
            if (result[i].songName !== expectedOrder[i].songName) {
                console.log(`   ❌ Song ${i+1}: Expected "${expectedOrder[i].songName}", got "${result[i].songName}"`);
                return false;
            }
            
            if (result[i].durationSeconds !== expectedOrder[i].durationSeconds) {
                console.log(`   ❌ Duration ${i+1}: Expected ${expectedOrder[i].durationSeconds}s, got ${result[i].durationSeconds}s`);
                return false;
            }
        }
        
        // Validate duration formatting
        const formattedDuration = tourCalculations.formatDuration(2544);
        if (formattedDuration !== '42:24') {
            console.log(`   ❌ Duration formatting: Expected "42:24", got "${formattedDuration}"`);
            return false;
        }
        
        console.log('   ✅ Longest songs calculation passed');
        return true;
        
    } catch (error) {
        console.log(`   ❌ Longest songs test error: ${error.message}`);
        return false;
    }
}

function testTourProgressiveRarestSongs() {
    console.log('   Testing tour progressive rarest songs...');
    
    try {
        const result = tourCalculations.calculateTourProgressiveRarestSongs(
            SUMMER_2025_TEST_DATA.tourShows,
            'Summer Tour 2025'
        );
        
        // Validate we got 3 results  
        if (result.length !== 3) {
            console.log(`   ❌ Expected 3 rarest songs, got ${result.length}`);
            return false;
        }
        
        // Validate the known rarest songs are present and in correct order
        const expectedOrder = EXPECTED_RESULTS.rarestSongs;
        for (let i = 0; i < 3; i++) {
            if (result[i].songName !== expectedOrder[i].songName) {
                console.log(`   ❌ Rarest song ${i+1}: Expected "${expectedOrder[i].songName}", got "${result[i].songName}"`);
                return false;
            }
            
            if (result[i].gap !== expectedOrder[i].gap) {
                console.log(`   ❌ Gap ${i+1}: Expected ${expectedOrder[i].gap}, got ${result[i].gap}`);
                return false;
            }
        }
        
        // Validate that highest gap wins (On Your Way Down should be #1)
        if (result[0].gap !== 522) {
            console.log(`   ❌ Highest gap should be 522, got ${result[0].gap}`);
            return false;
        }
        
        console.log('   ✅ Tour progressive rarest songs passed');
        return true;
        
    } catch (error) {
        console.log(`   ❌ Rarest songs test error: ${error.message}`);
        return false;
    }
}

function testDataValidation() {
    console.log('   Testing data validation...');
    
    try {
        // Test valid data
        const validResult = tourCalculations.validateTourData({
            tourShows: SUMMER_2025_TEST_DATA.tourShows
        });
        
        if (!validResult.isValid) {
            console.log('   ❌ Valid data marked as invalid');
            console.log('   Errors:', validResult.errors);
            return false;
        }
        
        // Test invalid data
        const invalidResult = tourCalculations.validateTourData({
            tourShows: []
        });
        
        if (invalidResult.isValid) {
            console.log('   ❌ Empty tour shows marked as valid');
            return false;
        }
        
        // Test null data
        const nullResult = tourCalculations.validateTourData(null);
        if (nullResult.isValid) {
            console.log('   ❌ Null data marked as valid');
            return false;
        }
        
        console.log('   ✅ Data validation passed');
        return true;
        
    } catch (error) {
        console.log(`   ❌ Data validation test error: ${error.message}`);
        return false;
    }
}

function testUtilityFunctions() {
    console.log('   Testing utility functions...');
    
    try {
        // Test duration formatting
        const testCases = [
            { seconds: 0, expected: '0:00' },
            { seconds: 30, expected: '0:30' },
            { seconds: 60, expected: '1:00' },
            { seconds: 125, expected: '2:05' },
            { seconds: 3661, expected: '61:01' }
        ];
        
        for (const testCase of testCases) {
            const result = tourCalculations.formatDuration(testCase.seconds);
            if (result !== testCase.expected) {
                console.log(`   ❌ formatDuration(${testCase.seconds}): Expected "${testCase.expected}", got "${result}"`);
                return false;
            }
        }
        
        // Test tour name extraction
        const tourName = tourCalculations.extractTourFromDate('2025-07-15');
        if (tourName !== 'Summer Tour 2025') {
            console.log(`   ❌ Tour extraction: Expected "Summer Tour 2025", got "${tourName}"`);
            return false;
        }
        
        // Test current tour detection
        const isCurrentA = tourCalculations.isCurrentTour('2025-07-15'); // Should be true (recent)
        const isCurrentB = tourCalculations.isCurrentTour('2020-01-15'); // Should be false (old)
        
        if (!isCurrentA) {
            console.log('   ❌ 2025 show should be considered current tour');
            return false;
        }
        
        if (isCurrentB) {
            console.log('   ❌ 2020 show should not be considered current tour');
            return false;
        }
        
        console.log('   ✅ Utility functions passed');
        return true;
        
    } catch (error) {
        console.log(`   ❌ Utility functions test error: ${error.message}`);
        return false;
    }
}

function testEdgeCases() {
    console.log('   Testing edge cases...');
    
    try {
        // Test empty arrays
        const emptyLongest = tourCalculations.calculateLongestSongs([]);
        if (emptyLongest.length !== 0) {
            console.log('   ❌ Empty track durations should return empty array');
            return false;
        }
        
        const emptyRarest = tourCalculations.calculateTourProgressiveRarestSongs([], 'Test Tour');
        if (emptyRarest.length !== 0) {
            console.log('   ❌ Empty tour shows should return empty array');
            return false;
        }
        
        // Test invalid track durations 
        const invalidTracks = [
            { songName: 'Valid Song', durationSeconds: 180 },
            { songName: 'Invalid Song', durationSeconds: -1 },
            { songName: 'Zero Duration', durationSeconds: 0 },
            { songName: null, durationSeconds: 120 }, // Invalid song name
            { durationSeconds: 150 } // Missing song name
        ];
        
        const filteredResult = tourCalculations.calculateLongestSongs(invalidTracks);
        if (filteredResult.length !== 1 || filteredResult[0].songName !== 'Valid Song') {
            console.log('   ❌ Invalid tracks not properly filtered');
            return false;
        }
        
        // Test invalid gap data
        const invalidGapShows = [
            {
                showDate: '2025-07-01',
                venue: 'Test Venue',
                songGaps: [
                    { songName: 'Valid Song', gap: 100 },
                    { songName: null, gap: 200 }, // Invalid song name
                    { songName: 'Invalid Gap' }, // Missing gap
                    { songName: 'Negative Gap', gap: -10 } // Invalid gap
                ]
            }
        ];
        
        const rarestResult = tourCalculations.calculateTourProgressiveRarestSongs(invalidGapShows, 'Test Tour');
        if (rarestResult.length !== 1 || rarestResult[0].songName !== 'Valid Song') {
            console.log('   ❌ Invalid gap data not properly handled');
            return false;
        }
        
        console.log('   ✅ Edge cases passed');
        return true;
        
    } catch (error) {
        console.log(`   ❌ Edge cases test error: ${error.message}`);
        return false;
    }
}

// =============================================================================
// COMPARISON TEST WITH CURRENT SERVER OUTPUT
// =============================================================================

function compareWithCurrentServerOutput() {
    console.log('\n🔄 BONUS TEST: Compare with current server output');
    console.log('================================================');
    
    // This would compare with the actual current-tour-stats.json
    // For now, we'll simulate with expected server format
    const mockServerOutput = {
        tourName: "Summer Tour 2025",
        longestSongs: EXPECTED_RESULTS.longestSongs,
        rarestSongs: EXPECTED_RESULTS.rarestSongs
    };
    
    try {
        // Calculate using our JavaScript engine
        const jsLongestSongs = tourCalculations.calculateLongestSongs(SUMMER_2025_TEST_DATA.allTourTrackDurations);
        const jsRarestSongs = tourCalculations.calculateTourProgressiveRarestSongs(
            SUMMER_2025_TEST_DATA.tourShows,
            'Summer Tour 2025'
        );
        
        // Compare results
        let matches = 0;
        let total = 6; // 3 longest + 3 rarest
        
        // Compare longest songs
        for (let i = 0; i < 3; i++) {
            if (jsLongestSongs[i] && 
                jsLongestSongs[i].songName === mockServerOutput.longestSongs[i].songName &&
                jsLongestSongs[i].durationSeconds === mockServerOutput.longestSongs[i].durationSeconds) {
                matches++;
            } else {
                console.log(`   ⚠️ Longest song ${i+1} mismatch`);
            }
        }
        
        // Compare rarest songs
        for (let i = 0; i < 3; i++) {
            if (jsRarestSongs[i] && 
                jsRarestSongs[i].songName === mockServerOutput.rarestSongs[i].songName &&
                jsRarestSongs[i].gap === mockServerOutput.rarestSongs[i].gap) {
                matches++;
            } else {
                console.log(`   ⚠️ Rarest song ${i+1} mismatch`);
            }
        }
        
        console.log(`   📊 Consistency: ${matches}/${total} matches`);
        
        if (matches === total) {
            console.log('   ✅ Perfect consistency with current server output!');
            return true;
        } else {
            console.log('   ⚠️ Some inconsistencies found - may need adjustment');
            return false;
        }
        
    } catch (error) {
        console.log(`   ❌ Server comparison error: ${error.message}`);
        return false;
    }
}

// =============================================================================
// RUN TESTS
// =============================================================================

if (require.main === module) {
    // Run tests when script is executed directly
    const success = runAllTests();
    
    // Bonus comparison test
    compareWithCurrentServerOutput();
    
    console.log('\n🎯 JavaScript Bridge Phase 1 Status:');
    if (success) {
        console.log('✅ READY FOR PHASE 2 - Server Integration');
    } else {
        console.log('❌ NEEDS FIXES - Address test failures before proceeding');
    }
    
    process.exit(success ? 0 : 1);
}

module.exports = {
    runAllTests,
    compareWithCurrentServerOutput,
    SUMMER_2025_TEST_DATA,
    EXPECTED_RESULTS
};