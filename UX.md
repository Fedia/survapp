# User Stories

1. [DONE] As an anonymous user I can enter my email address and recieve a "magic link" which instantly signs me in
1. [DONE] As as a user I can see a list of surveys for which I have read/edit access
1. [DONE] As as a user I can create a new survey with title and body
1. [DONE] As as a survey editor I can edit survey markup, delete my surveys and download survey responses
1. [DONE] As a survey reader I can view the markup and download survey responses
1. [DONE] As as a survey editor I can publish my survey at a custom URL path
1. [DONE] As as a user I can restore deleted surveys from recycle bin

# Tech

survey markdown -> remark-parse -> ast -> survey transforms -> svelte components
