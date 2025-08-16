###########################
# File: fomc_pull.R
# Description: This file is used to scrape data from FOMC website
# Date: 8/16/2025
# Author: Anthony Trevisan
# Notes:
###########################


# install.packages("rvest")
# install.packages("xml2")

library(rvest)
library(xml2)

# For history
url <- 'https://www.federalreserve.gov/monetarypolicy/fomchistorical1993.htm'

url = 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'

for(yrpl in c(1993:2019)){
  
  
  print(yrpl)
  
  # Create the URL
  url <- paste0('https://www.federalreserve.gov/monetarypolicy/fomchistorical',yrpl,'.htm')
  page <- read_html(url)
  
  # Get the links
  links <- page %>%
    html_elements("a") %>%
    html_attr("href")

  # Folder to save - create it if it doesn't exist
  output_dir <- paste0("/path/to/folder/minutes/",yrpl,'/')
  
  if (!dir.exists(output_dir)) {
    dir.create(output_dir, recursive = TRUE)
  }

  # Get the links for meeting minutes and download them
  minutes_links <- links[grepl("minutes", tolower(links)) & !grepl("#", tolower(links))]
  for(mn in minutes_links){
    print(mn)
  

    if(grepl('htm',mn)){
      mns = read_lines(paste0('https://www.federalreserve.gov/',mn))
      write_lines(mns,paste0(output_dir,gsub('.*/','',gsub('htm','txt',mn))))
    } else {
      download.file(paste0('https://www.federalreserve.gov/',mn),paste0(output_dir,gsub('.*/','',mn)))
    }
  
  }

  # Prepare to save meeting transcripts
  output_dir <- paste0("/path/to/folder/transcripts/",yrpl,'/')
  
  if (!dir.exists(output_dir)) {
    dir.create(output_dir, recursive = TRUE)
  }
  
  transcript_links <- links[grepl("meeting.pdf", tolower(links))]
  for(tl in transcript_links){
    print(tl)
    download.file(paste0('https://www.federalreserve.gov/',tl),paste0(output_dir,gsub('.*/','',tl)))
  }

}


