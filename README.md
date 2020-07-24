# sadpepe

[https://sadpepe.net/](https://sadpepe.net/)

User tracking for DGG.

Feel free to create issues or pull requests or whatever. I just made this a few days ago for fun, so there is a lot to do!

## Installation

Clone the repository and use `yarn` to install the dependencies.


This project is in two parts:
 
 ## Tracking Server
 A server built on nodejs that reads the dgg websocket for changes. Stores user time in firebase. 
 
 Related Scripts:
 
 ```
 yarn track - starts the tracking server
 yarn end - cleanly stops tracking, used when restarting the server
 yarn reset - resets all user data
 yarn fix - adds time to users to account for server downtime, requires manual time calculations
 ```
 
 ## Web Site
 Vuejs webpage for displaying the server data. Hosted as a static site on firebase hosting.
 
 Related Scripts:
```
yarn serve - local dev server, hot-reloads on save
yarn build - transpiles to static html and js
firebase deploy - deploys to firebase
```
