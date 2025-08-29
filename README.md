# PhishQS-Server

**Server-side tour statistics computation for PhishQS iOS app**

This repository provides pre-computed tour statistics to eliminate 60+ second load times in the PhishQS iOS app, delivering instant (<1 second) tour statistics loading.

## Overview

- **GitHub Actions**: Automated monitoring for new Phish shows
- **Smart Calculation**: Server-side computation of tour statistics once, served to all users
- **JSON API**: RESTful endpoint serving current tour statistics
- **Fallback Strategy**: iOS app gracefully falls back to local calculation if server unavailable

## Architecture

```
GitHub Actions (every 6 hours) → Monitor Phish.net → Calculate Stats → Update JSON → GitHub Pages serves endpoint
```

## Endpoints

- **Production**: `https://api.phishqs.com/current-tour-stats.json`
- **Development**: `https://yourusername.github.io/PhishQS-Server/current-tour-stats.json`

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Tour Statistics Load | 60+ seconds | <1 second | 99%+ faster |
| API Calls to Phish.net | 60+ per user | 60 total per day | 99.9% reduction |
| User Experience | Unacceptable wait | Instant loading | Immediate |

## Deployment

See the complete deployment guide in the main PhishQS repository: `Docs/ServerSideTourStats.md`

## API Response Structure

```json
{
  "tourName": "Summer Tour 2025",
  "lastUpdated": "2025-08-28T15:30:00Z",
  "latestShow": "2025-07-27",
  "longestSongs": [
    {
      "songName": "Tweezer",
      "durationSeconds": 1383,
      "showDate": "2025-07-27",
      "venue": "Broadview Stage at SPAC",
      "venueRun": { "showNumber": 3, "totalShows": 3, "displayText": "N3/3" }
    }
  ],
  "rarestSongs": [
    {
      "songName": "On Your Way Down",
      "gap": 522,
      "lastPlayed": "2011-08-06", 
      "tourDate": "2025-07-18",
      "tourVenue": "United Center"
    }
  ]
}
```

## License

MIT License - See main PhishQS repository for details