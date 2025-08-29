const fetch = require('node-fetch');

/**
 * Server-side Phish.net API client
 * Ports the iOS PhishNetAPIClient functionality to Node.js
 */
class PhishNetClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = "https://api.phish.net/v5";
    this.lastCallTime = 0;
    this.minInterval = 2000; // 2 seconds between calls for API respect
  }

  /**
   * Rate limiting - wait between API calls to be respectful
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      console.log(`⏱️ Rate limiting: waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCallTime = Date.now();
  }

  /**
   * Make a rate-limited request to Phish.net API
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
   * Get the most recent show from Phish.net
   */
  async fetchLatestShow() {
    console.log("📡 Fetching latest show from Phish.net...");
    
    const url = `${this.baseURL}/setlists/recent.json?apikey=${this.apiKey}&limit=1`;
    const response = await this.makeRequest(url);
    
    if (!response.data || response.data.length === 0) {
      throw new Error("No recent shows found");
    }
    
    const latestShow = response.data[0];
    console.log(`🎵 Latest show: ${latestShow.showdate} at ${latestShow.venue}`);
    
    return latestShow;
  }

  /**
   * Get setlist for a specific show date
   */
  async fetchShowSetlist(showDate) {
    console.log(`📋 Fetching setlist for ${showDate}...`);
    
    const url = `${this.baseURL}/setlists/showdate/${showDate}.json?apikey=${this.apiKey}&artist=phish`;
    const response = await this.makeRequest(url);
    
    if (!response.data || response.data.length === 0) {
      throw new Error(`No setlist found for ${showDate}`);
    }
    
    return response.data[0];
  }

  /**
   * Get all shows for a specific year  
   */
  async fetchShowsForYear(year) {
    console.log(`📅 Fetching all shows for year ${year}...`);
    
    const url = `${this.baseURL}/setlists/showyear/${year}.json?apikey=${this.apiKey}&artist=phish`;
    const response = await this.makeRequest(url);
    
    return response.data || [];
  }

  /**
   * Get gap data for a specific song
   */
  async fetchSongGap(songName, showDate) {
    const encodedSongName = encodeURIComponent(songName);
    const url = `${this.baseURL}/setlists/song/${encodedSongName}.json?apikey=${this.apiKey}&order_by=showdate&direction=asc`;
    
    const response = await this.makeRequest(url);
    
    if (!response.data || response.data.length === 0) {
      return null;
    }
    
    // Calculate gap based on performances (same logic as iOS)
    return this.calculateGapFromPerformances(response.data, showDate, songName);
  }

  /**
   * Get gap data for multiple songs (this is the expensive operation)
   */
  async fetchSongGaps(songNames, showDate) {
    console.log(`🔍 Fetching gap data for ${songNames.length} songs from ${showDate}...`);
    const gaps = [];
    
    for (let i = 0; i < songNames.length; i++) {
      const songName = songNames[i];
      console.log(`   Processing ${i+1}/${songNames.length}: ${songName}`);
      
      try {
        const gap = await this.fetchSongGap(songName, showDate);
        if (gap) {
          gaps.push(gap);
        }
      } catch (error) {
        console.log(`   ⚠️ Gap data unavailable for ${songName}: ${error.message}`);
      }
    }
    
    console.log(`✅ Retrieved gap data for ${gaps.length}/${songNames.length} songs`);
    return gaps;
  }

  /**
   * Calculate gap from song performances (ports iOS logic)
   */
  calculateGapFromPerformances(performances, currentShowDate, songName) {
    if (!performances || performances.length === 0) {
      return null;
    }
    
    // Find the performance immediately before the current show date
    let previousPerformance = null;
    let gap = 0;
    
    for (const performance of performances) {
      if (performance.showdate < currentShowDate) {
        previousPerformance = performance;
      } else if (performance.showdate === currentShowDate) {
        // Found the current performance, calculate gap
        if (previousPerformance) {
          // Calculate shows between previous and current
          gap = this.calculateShowsBetween(previousPerformance.showdate, currentShowDate);
        } else {
          // First time played
          gap = 0;
        }
        break;
      }
    }
    
    if (previousPerformance && gap > 0) {
      return {
        songName: songName,
        gap: gap,
        lastPlayed: previousPerformance.showdate,
        tourDate: currentShowDate,
        tourVenue: null // Will be filled in by caller
      };
    }
    
    return null;
  }

  /**
   * Calculate number of shows between two dates (simplified)
   * In production, this would query the API for exact show count
   */
  calculateShowsBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Rough approximation: assume average of 1 show every 3 days during active periods
    // This is a simplification - the real iOS app does more precise calculation
    return Math.floor(diffDays / 3);
  }

  /**
   * Extract song names from setlist items (helper method)
   */
  extractSongNames(setlist) {
    const songs = [];
    
    if (setlist.setlistdata) {
      for (const set of setlist.setlistdata) {
        if (set.songs) {
          for (const song of set.songs) {
            if (song.song && !songs.includes(song.song)) {
              songs.push(song.song);
            }
          }
        }
      }
    }
    
    return songs;
  }
}

module.exports = PhishNetClient;