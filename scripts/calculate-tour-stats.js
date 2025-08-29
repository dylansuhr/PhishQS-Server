const PhishNetClient = require('./phish-net-client');
const PhishInClient = require('./phish-in-client');

/**
 * Tour Statistics Calculator
 * Ports the iOS TourStatisticsService logic to Node.js server-side calculation
 */
class TourStatisticsCalculator {
  constructor(phishNetAPIKey) {
    this.phishNet = new PhishNetClient(phishNetAPIKey);
    this.phishIn = new PhishInClient();
  }

  /**
   * Main method: Calculate current tour statistics
   * This is the server-side equivalent of the iOS fetchTourStatistics method
   */
  async calculateCurrentTourStatistics() {
    console.log("🎯 Starting server-side tour statistics calculation...");
    
    try {
      // 1. Get latest show to determine current tour
      const latestShow = await this.phishNet.fetchLatestShow();
      const currentTour = await this.phishIn.getTourForShow(latestShow.showdate);
      
      console.log(`📊 Calculating statistics for: ${currentTour.tourName}`);
      
      // 2. Calculate longest songs from tour-wide track durations
      const longestSongs = await this.calculateLongestSongs(currentTour.tourName, latestShow.showdate);
      
      // 3. Calculate rarest songs using tour-progressive gap analysis  
      const rarestSongs = await this.calculateRarestSongs(currentTour, latestShow);
      
      // 4. Build final statistics object matching iOS ServerTourStatsResponse format
      const statistics = {
        tourName: currentTour.tourName,
        lastUpdated: new Date().toISOString(),
        latestShow: latestShow.showdate,
        longestSongs: longestSongs,
        rarestSongs: rarestSongs
      };
      
      console.log("✅ Tour statistics calculation complete");
      console.log(`🎵 Longest songs: ${longestSongs.length}`);
      console.log(`🎪 Rarest songs: ${rarestSongs.length}`);
      
      return statistics;
      
    } catch (error) {
      console.error("❌ Tour statistics calculation failed:", error);
      throw error;
    }
  }

  /**
   * Calculate longest songs from tour track durations
   * Ports iOS logic for longest song calculation
   */
  async calculateLongestSongs(tourName, latestShowDate) {
    console.log("🎵 Calculating longest songs from tour track durations...");
    
    try {
      // Fetch all track durations for the current tour (replaces individual API calls)
      const tourTrackDurations = await this.phishIn.fetchTourTrackDurations(tourName);
      
      if (!tourTrackDurations || tourTrackDurations.length === 0) {
        console.log("⚠️ No track durations available for tour - using fallback method");
        return await this.calculateLongestSongsFallback(latestShowDate);
      }
      
      // Get top 3 longest songs
      const longestSongs = tourTrackDurations
        .filter(track => track.durationSeconds > 0) // Only include tracks with valid durations
        .sort((a, b) => b.durationSeconds - a.durationSeconds)
        .slice(0, 3)
        .map(track => ({
          songName: track.songName,
          durationSeconds: track.durationSeconds,
          showDate: track.showDate,
          venue: track.venue,
          venueRun: track.venueRun
        }));
      
      console.log(`🏆 Top 3 longest songs calculated (${longestSongs.length} songs)`);
      longestSongs.forEach((song, i) => {
        const duration = this.formatDuration(song.durationSeconds);
        console.log(`   ${i+1}. ${song.songName} - ${duration} (${song.showDate})`);
      });
      
      return longestSongs;
      
    } catch (error) {
      console.log(`⚠️ Error fetching tour track durations: ${error.message}`);
      return await this.calculateLongestSongsFallback(latestShowDate);
    }
  }

  /**
   * Fallback method for longest songs when tour data unavailable
   */
  async calculateLongestSongsFallback(latestShowDate) {
    console.log("🔄 Using fallback method for longest songs...");
    
    try {
      // Get setlist for latest show as fallback
      const latestSetlist = await this.phishNet.fetchShowSetlist(latestShowDate);
      const songNames = this.phishNet.extractSongNames(latestSetlist);
      
      // This is a simplified fallback - in production you'd want better logic here
      return songNames.slice(0, 3).map((songName, index) => ({
        songName: songName,
        durationSeconds: 600 - (index * 100), // Placeholder durations
        showDate: latestShowDate,
        venue: latestSetlist.venue,
        venueRun: null
      }));
    } catch (error) {
      console.log(`⚠️ Fallback method also failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculate rarest songs using tour-progressive gap analysis
   * This is the most complex part - ports iOS TourStatisticsService.calculateTourProgressiveRarestSongs
   */
  async calculateRarestSongs(currentTour, latestShow) {
    console.log("🔍 Calculating tour-progressive rarest songs...");
    
    try {
      // 1. Get all shows from current tour (chronologically)
      const tourShows = await this.fetchAllTourShows(currentTour, latestShow.showdate);
      console.log(`📅 Found ${tourShows.length} shows in ${currentTour.tourName}`);
      
      // 2. Track highest gap for each song across the tour
      const tourSongGaps = new Map();
      
      for (let i = 0; i < tourShows.length; i++) {
        const show = tourShows[i];
        console.log(`   Processing show ${i+1}/${tourShows.length}: ${show.showdate}`);
        
        try {
          // Get setlist for this show
          const setlist = await this.phishNet.fetchShowSetlist(show.showdate);
          
          // Extract song names from setlist
          const songNames = this.phishNet.extractSongNames(setlist);
          
          // Get gap data for all songs in this show (this is the expensive part)
          const gapData = await this.phishNet.fetchSongGaps(songNames, show.showdate);
          
          // Track highest gap for each song across tour
          gapData.forEach(gap => {
            const existingGap = tourSongGaps.get(gap.songName);
            if (!existingGap || gap.gap > existingGap.gap) {
              tourSongGaps.set(gap.songName, {
                songName: gap.songName,
                gap: gap.gap,
                lastPlayed: gap.lastPlayed,
                tourDate: show.showdate,
                tourVenue: show.venue
              });
            }
          });
          
        } catch (showError) {
          console.log(`   ⚠️ Could not process show ${show.showdate}: ${showError.message}`);
          continue;
        }
      }
      
      // 3. Get top 3 rarest songs
      const rarestSongs = Array.from(tourSongGaps.values())
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 3);
      
      console.log(`🎪 Top 3 rarest songs calculated:`);
      rarestSongs.forEach((song, i) => {
        console.log(`   ${i+1}. ${song.songName} - Gap: ${song.gap} (last: ${song.lastPlayed})`);
      });
      
      return rarestSongs;
      
    } catch (error) {
      console.log(`⚠️ Error calculating rarest songs: ${error.message}`);
      return [];
    }
  }

  /**
   * Get all shows from current tour in chronological order
   */
  async fetchAllTourShows(currentTour, latestShowDate) {
    console.log(`📅 Fetching all shows for tour: ${currentTour.tourName}`);
    
    try {
      // Get tour position info to understand tour scope
      const tourPosition = await this.phishIn.getTourPosition(latestShowDate, currentTour.tourName);
      
      if (tourPosition) {
        console.log(`🎯 Tour scope: ${tourPosition.showNumber} of ${tourPosition.totalShows} shows`);
      }
      
      // For now, we'll get shows from the current year as a proxy for tour shows
      // In production, you'd want more sophisticated tour detection
      const year = latestShowDate.substring(0, 4);
      const yearShows = await this.phishNet.fetchShowsForYear(year);
      
      // Filter to shows up to and including the latest show date
      const tourShows = yearShows
        .filter(show => show.showdate <= latestShowDate)
        .sort((a, b) => a.showdate.localeCompare(b.showdate));
      
      return tourShows;
      
    } catch (error) {
      console.log(`⚠️ Error fetching tour shows: ${error.message}`);
      // Fallback: just return the latest show
      return [{ showdate: latestShowDate, venue: 'Unknown' }];
    }
  }

  /**
   * Format duration in seconds to MM:SS format
   */
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

module.exports = TourStatisticsCalculator;