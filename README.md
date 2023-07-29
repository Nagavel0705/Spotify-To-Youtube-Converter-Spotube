# Spotube
## Enables users to obtain youtube links of all the videos in their Spotify playlists by integrating the Spotify API and the Youtube Data v3 API
- If you wish to use the app through the deployment, send a request through the website (ensure that the email you use is the one linked with your Spotify account)
- This is necessary as Spotify only allows the email IDs that the developer of the app authorizes, to use the app
- Also your playlists will be restricted to 100 songs per playlist, because well, YouTube's quota restrictions :')

### Functionalities
<sup><sub>P.S. Green highlights are Spotify and Red highlights are Youtube xD</sub></sup>
1) Obtain the youtube video links to all the songs in a playlist of your Spotify library


https://github.com/Nagavel0705/Spotify-To-Youtube-Converter-Spotube/assets/96764518/edde1917-18a4-44dc-8291-deae36525bd4



2) Also capable of converting an external playlist, provided it's link, and storing it in your account


https://github.com/Nagavel0705/Spotify-To-Youtube-Converter-Spotube/assets/96764518/386b5ab4-6e31-4593-8444-22bcb249dc9b


3) Convert songs individually


https://github.com/Nagavel0705/Spotify-To-Youtube-Converter-Spotube/assets/96764518/6afe718e-3fef-4d3c-a6d2-a52a4219aa42


4) Built-In YouTube videoplayer
5) Storage of previously converted playlists to your account for future access
6) Reduces API calls by preventing reconversion of previously converted playlists


https://github.com/Nagavel0705/Spotify-To-Youtube-Converter-Spotube/assets/96764518/e617c563-a585-409e-abad-a5da6f1b05c2


(Notice the faster conversion speeds when converted for the 2nd time in comparison to the first. This is because conversion is expensive due to YouTube quota limits. It is better (and faster) to store the links obtained during the first conversion in the database pertaining to the user and retrieve links from the DB for future conversions) 

### Deployed at: [https://spotube.cyclic.app/](https://spotube.cyclic.app/)
