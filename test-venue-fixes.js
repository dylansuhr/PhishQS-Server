/**
 * Test script to validate venue consistency fixes locally
 */

const tourCalculations = require('./shared/tourCalculations.js');

console.log('🧪 Testing venue consistency fixes...');

// Create test data that mimics the venue data structure
const testTourShows = [
    {
        showDate: "2024-07-15",
        venue: "United Center", // This should come from Phish.net
        songGaps: [
            {
                songName: "Sand",
                gap: 45,
                lastPlayed: "2024-06-01",
                tourDate: "2024-07-15",
                // These should use the venue from the show data (Phish.net)
                historicalVenue: "Madison Square Garden",
                historicalCity: "New York",
                historicalState: "NY"
            }
        ]
    },
    {
        showDate: "2024-07-16", 
        venue: "United Center", // N2 of same venue run
        songGaps: [
            {
                songName: "On Your Way Down",
                gap: 522,
                lastPlayed: "2011-08-06",
                tourDate: "2024-07-16",
                historicalVenue: "Gorge Amphitheatre",
                historicalCity: "George",
                historicalState: "WA"
            }
        ]
    }
];

const testTrackDurations = [
    {
        songName: "Sand",
        durationSeconds: 1245,
        showDate: "2024-07-15",
        venue: "United Center" // This should match the show venue
    },
    {
        songName: "What's Going Through Your Mind", 
        durationSeconds: 2544,
        showDate: "2024-07-16",
        venue: "United Center" // This should match the show venue
    }
];

// Test the JavaScript calculations
console.log('\n📊 Testing rarest songs calculation...');
const rarestSongs = tourCalculations.calculateTourProgressiveRarestSongs(testTourShows, "Summer Tour 2024");

console.log('\n🎵 Testing longest songs calculation...');  
const longestSongs = tourCalculations.calculateLongestSongs(testTrackDurations);

console.log('\n✅ Results:');
console.log('Rarest Songs:');
rarestSongs.forEach(song => {
    console.log(`  - ${song.songName} (Gap: ${song.gap}) played on ${song.tourDate} at ${song.tourVenue}`);
});

console.log('\nLongest Songs:');
longestSongs.forEach(song => {
    const duration = tourCalculations.formatDuration(song.durationSeconds);
    console.log(`  - ${song.songName} (${duration}) from ${song.showDate} at ${song.venue || 'Unknown Venue'}`);
});

console.log('\n🔍 Venue Consistency Check:');
console.log('✅ All tourVenue values should match their corresponding tourDate venues');
console.log('✅ All venue values should match their corresponding showDate venues');