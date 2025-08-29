const fetch = require('node-fetch');

/**
 * Server-side Phish.in API client
 * Ports the iOS PhishInAPIClient functionality to Node.js
 */
class PhishInClient {
  constructor() {
    this.baseURL = "https://api.phish.in/v2";
    this.lastCallTime = 0;
    this.minInterval = 1000; // 1 second between calls
  }

  /**
   * Rate limiting for Phish.in API
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCallTime = Date.now();
  }

  /**
   * Make a rate-limited request to Phish.in API
   */
  async makeRequest(url) {
    await this.waitForRateLimit();
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get tour information for a specific show date
   */
  async getTourForShow(showDate) {
    console.log(`🎪 Getting tour information for ${showDate}...`);
    
    try {
      // Get shows for the year to find tour context
      const year = showDate.substring(0, 4);
      const url = `${this.baseURL}/shows?year=${year}`;
      const response = await this.makeRequest(url);
      
      if (!response.data) {
        throw new Error("No show data found");
      }
      
      // Find the specific show and its tour
      const show = response.data.find(s => s.date === showDate);
      if (!show) {
        throw new Error(`Show not found for date ${showDate}`);
      }
      
      return {
        tourName: show.tour?.name || `${year} Tour`,
        tourSlug: show.tour?.slug || `${year}-tour`
      };
    } catch (error) {
      console.log(`⚠️ Could not determine tour for ${showDate}: ${error.message}`);
      // Fallback to year-based tour name
      const year = showDate.substring(0, 4);
      return {
        tourName: `${year} Tour`,
        tourSlug: `${year}-tour`
      };
    }
  }

  /**
   * Get all track durations for a specific tour
   */
  async fetchTourTrackDurations(tourName) {
    console.log(`🎵 Fetching tour track durations for ${tourName}...`);
    
    try {
      // Convert tour name to approximate slug format
      const tourSlug = this.tourNameToSlug(tourName);
      const url = `${this.baseURL}/tours/${tourSlug}/tracks`;
      const response = await this.makeRequest(url);
      
      if (!response.data) {
        console.log(`⚠️ No track data found for tour ${tourName}`);
        return [];
      }
      
      // Convert Phish.in track format to our format
      const trackDurations = response.data.map(track => ({
        songName: track.title || track.name,
        durationSeconds: track.duration || 0,
        showDate: track.show?.date || '',
        venue: track.show?.venue?.name || '',
        venueRun: this.extractVenueRun(track.show)
      }));
      
      console.log(`🎯 Found ${trackDurations.length} tracks for ${tourName}`);
      return trackDurations;
      
    } catch (error) {
      console.log(`⚠️ Could not fetch tour track durations: ${error.message}`);
      return [];
    }
  }

  /**
   * Get tour position information for a show
   */
  async getTourPosition(showDate, tourName) {
    console.log(`📊 Getting tour position for ${showDate} in ${tourName}...`);
    
    try {
      // Get all shows in the tour
      const tourSlug = this.tourNameToSlug(tourName);
      const url = `${this.baseURL}/tours/${tourSlug}/shows`;
      const response = await this.makeRequest(url);
      
      if (!response.data) {
        return null;
      }
      
      const tourShows = response.data.sort((a, b) => a.date.localeCompare(b.date));
      const showIndex = tourShows.findIndex(show => show.date === showDate);
      
      if (showIndex === -1) {
        return null;
      }
      
      return {
        tourName: tourName,
        showNumber: showIndex + 1,
        totalShows: tourShows.length,
        displayText: `Show ${showIndex + 1}/${tourShows.length}`
      };
      
    } catch (error) {
      console.log(`⚠️ Could not determine tour position: ${error.message}`);
      return null;
    }
  }

  /**
   * Convert tour name to slug format for API calls
   */
  tourNameToSlug(tourName) {
    return tourName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Extract venue run information from show data
   */
  extractVenueRun(show) {
    if (!show || !show.venue) {
      return null;
    }
    
    // This is a simplified version - the real logic would be more complex
    return {
      showNumber: 1,
      totalShows: 1,
      displayText: "N1/1"
    };
  }

  /**
   * Get native tour name from Phish.in for a show date
   */
  async getNativeTourName(showDate) {
    console.log(`🔍 Getting native tour name for ${showDate}...`);
    
    try {
      const tourInfo = await this.getTourForShow(showDate);
      return tourInfo.tourName;
    } catch (error) {
      console.log(`⚠️ Could not get native tour name: ${error.message}`);
      return null;
    }
  }
}

module.exports = PhishInClient;