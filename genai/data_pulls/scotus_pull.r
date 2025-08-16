###########################
# File: scotus_pull.R
# Description: This file is used to scrape SCOTUS data
# Date: 8/16/2025
# Author: Anthony Trevisan
# Notes:
###########################

library(httr)


opinion = GET(paste0('https://www.courtlistener.com/api/rest/v4/opinions/?cluster__docket__court=scotus&page_size=20'))

i=1
for(i in 1:500){
  print(i)
  
  op = content(opinion)
  
  
  for(r in op$results){
    print(r$absolute_url)
    nm = gsub('/opinion/','',r$absolute_url)
    nm = gsub('/','_',nm)
    
    dir.create(paste0('txt/',substr(r$date_created,1,4)), recursive = TRUE, showWarnings = FALSE)
    lng = nchar(r$sha1)
    fl = paste0('txt/',substr(r$date_created,1,4),'/',substr(r$date_created,1,10),'_',nm,substr(r$sha1,lng-3,lng),'.txt')
    if(r$html_with_citations==""){
      writeLines(r$plain_text,fl)
    } else {
      writeLines(r$html_with_citations,fl)
    }
  }
  Sys.sleep(5)
  opinion = GET(op$`next`)
  if(opinion$status_code == '200'){
    saveRDS(op$`next`,'nextopinion.rds')
  }
  content(opinion)
}






