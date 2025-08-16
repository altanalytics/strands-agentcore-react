# Data Collection Scripts

This folder contains R scripts for collecting data from various sources to build knowledge bases for the AI agent.

## Scripts

### fomc_data_scraper.R
Scrapes Federal Open Market Committee (FOMC) meeting data from the Federal Reserve website.

**Data Sources:**
- Meeting Minutes (HTML/PDF formats)
- Meeting Transcripts (PDF format)
- Years covered: 1993-2019

**Output Structure:**
```
/path/to/save/folder/fomc/
├── minutes/
│   ├── 1993/
│   ├── 1994/
│   └── ...
└── transcripts/
    ├── 1993/
    ├── 1994/
    └── ...
```

### scotus_data_scraper.R
Scrapes Supreme Court of the United States (SCOTUS) opinions from CourtListener API.

**Data Sources:**
- Court opinions and decisions
- HTML with citations and plain text formats
- Organized by date created

**Output Structure:**
```
/path/to/save/folder/scotus/
├── txt/
│   ├── 2020/
│   ├── 2021/
│   └── ...
```

**Features:**
- API pagination handling
- Rate limiting (5 second delays)
- Automatic folder organization by year
- S3 upload capability for batch processing

## Usage

1. Update the file paths in each script to match your desired output location
2. Install required R packages:
   ```r
   install.packages(c("rvest", "xml2", "readr", "pdftools", "httr", "httr2", "jsonlite"))
   ```
3. Run the scripts to collect data for your knowledge base

## Notes

- Scripts include rate limiting to be respectful to source servers
- Error handling included for robust data collection
- Both scripts can be modified to adjust date ranges or output formats
- Consider legal and ethical guidelines when scraping data
