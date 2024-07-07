const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
require("dotenv").config();
const SpotifyWebApi = require("spotify-web-api-node");
const youtube = require("@googleapis/youtube").youtube("v3");
const mongoose = require("mongoose");
const cors = require("cors");

mongoose.connect(
  "mongodb+srv://" +
    process.env.ATLAS_USERNAME +
    ":" +
    process.env.ATLAS_PASSWORD +
    "@cluster0.d6xb0qt.mongodb.net/SpotifyDB"
);

const User = mongoose.model("User", {
  email: String,
  id: String,
  accessToken: String,
  refreshToken: String,
  convertedPlaylists: Array,
});

const app = express();
app.use(express.static("public"));

app.set('views', path.join(__dirname, './views'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = ["https://spotube.cyclic.app"];

// Enable CORS with specified allowed origins
app.use(
  cors({
    origin: allowedOrigins,
  })
);

const scopes = [
  "ugc-image-upload",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-read-private",
  "user-library-read",
];

const youtubeKey = process.env.YOUTUBE_KEY;

const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.redirectURI,
  clientId: process.env.clientID,
  clientSecret: process.env.clientSecret,
});

// FIRST TIME USERS TO REQUEST ACCESS TO BE ADDED TO THE USER LIST
app.get("/requestAccess", (req, res) => {
  const emailAddress = "nagavel2003@gmail.com";
  const subject = "Request Access to Spotube";
  const redirectToGmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    emailAddress
  )}&su=${encodeURIComponent(subject)}`;
  res.redirect(redirectToGmailURL);
});

// AUTHORIZATION OF THE USER
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get("/callback", (req, res) => {
  const error = req.query.error;
  const code = req.query.code;

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  // EXCHANGE THE AUTHORIZATION CODE FOR ACCESS TOKEN AND REFRESH TOKEN
  spotifyApi
    .authorizationCodeGrant(code)
    .then(async (data) => {
      // console.log(data);
      const access_token = data.body["access_token"];
      const refresh_token = data.body["refresh_token"];
      const expires_in = data.body["expires_in"];

      // SETTING THE ACCESS AND REFRESH TOKENS
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );

      // STORING THE LOGGED IN USER TO THE DATABASE IF NOT ALREADY PRESENT

      // THIS IS DONE TO STORE THE ALREADY CONVERTED PLAYLISTS OF THE USER

      // THIS REDUCES NUMBER OF API CALLS TO YOUTUBE

      // THIS IS BECAUSE API CALLS ARE EXPENSIVE AND CAN'T AFFORD TO CONVERT
      // THE SAME PLAYLIST AGAIN AND AGAIN
      try {
        const me = await spotifyApi.getMe();

        currentUserEmail = me.body.email;


        // console.log(JSON.stringify(me, null, 4));

        const isUserExisting = await User.findOne({ email: currentUserEmail });

        if (!isUserExisting) {
          const user = new User({
            email: currentUserEmail,
            id: me.body.id,
            accessToken: access_token,
            refreshToken: refresh_token,
          });

          user.save();
        } else {
          await User.findOneAndUpdate(
            { email: currentUserEmail },
            { accessToken: access_token, refreshToken: refresh_token }
          );
        }

        profileDp =
          me.body.images.length === 0
            ? "Spotify_App_Logo.svg.png"
            : me.body.images[1]["url"];

        // REDIRECTING TO WELCOME PAGE WHICH DISPLAYS THE USER'S NAME AND PROFILE PICTURE
        res.render("welcome", {
          profilePic: profileDp,
          name: me.body["display_name"],
          email: currentUserEmail,
          error: "",
        });
      } catch (e) {
        console.error("Error getting user", e);
      }

      // THE ACCESS TOKEN NEEDS TO BE REFRESHED AS IT EXPIRES AFTER 3600 SECONDS
      // THIS FUNCTION RUNS ASYNCHRONOUSLY EVERY 3500 SECONDS
      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body["access_token"];

        console.log("The access token has been refreshed!");
        console.log("access_token:", access_token);
        spotifyApi.setAccessToken(access_token);

        await User.findOneAndUpdate(
          { email: currentUserEmail },
          { accessToken: access_token }
        );
      }, 3500000);
    })
    .catch(() => {
      console.log("Invalid authorization code");
      res.sendFile(__dirname + "/public/error.html");
    });
});

// DISPLAYING THE PLAYLISTS IN THE USER'S SPOTIFY LIBRARY
app.post("/myPlaylists", async function (req, res) {
  const currentUserEmail = req.body.emailFeedback;

  const user = await User.findOne({ email: currentUserEmail });

  // console.log(user);
  try{
    const data = await spotifyApi.getUserPlaylists(user.id);

    console.log("--------------------+++++++++++++++++++++++++");
    let playlists = [];

    // console.log(JSON.stringify(data, null, 4));

    for (let playlist of data.body.items) {
      // DISPLAYED ITEMS ARE THE PLAYLIST IMAGE, NAME
      // ID IS FOR RETRIEVING THE SONGS IN THE PLAYLIST IN THE NEXT STEP
      playlists.push([playlist.images[0].url, playlist.name, playlist.id]);
    }

    // console.log(playlists);

    res.render("MyPlaylists", { playlists: playlists });
  } catch(err){
    res.json(`${err.statusCode} Not Authorized. Request access if you are a first time user`);
  }
});

// DISPLAYING THE PREVIOUSLY CONVERTED PLAYLISTS
app.post("/myConvertedPlaylists", async function (req, res) {
  const currentUserEmail = req.body.emailFeedback;

  const user = await User.findOne({ email: currentUserEmail });

  // STORES THE PLAYLIST IMAGE AND NAME FOR ALL THE PREVIOUSLY CONVERTED PLAYLISTS
  let prevConverts = [];

  user.convertedPlaylists.forEach((playlist) => {
    prevConverts.push([playlist[0][0], playlist[0][1]]);
  });

  res.render("MyConvertedPlaylists", { prevConverts: prevConverts, email: currentUserEmail });
});

// DISPLAYING THE YOUTUBE SONGS IN THE PREVIOUSLY CONVERTED PLAYLIST
app.post("/getPrevConvertedPlaylistsSongs", async function (req, res) {
  const currentUserEmail = req.body.emailFeedback;
  const user = await User.findOne({ email: currentUserEmail });
  const playlistName = req.body.playlistName;
  user.convertedPlaylists.forEach((playlist) => {
    if (playlist[0][1] === playlistName) {
      res.render("MyConvertedPlaylistTracks", { youtubePlaylist: playlist, email: currentUserEmail });
    }
  });
});

// RETRIEVING THE SONGS IN THE USER'S SPECIFIED SPOTIFY PLAYLIST
app.post("/getUserPlaylistSongs", async function (req, res) {
  const {playlistImg, playlistName, playlistId} = req.body;

  // THE BELOW ARRAY STORES THE TRACK NAME, TRACK IMAGE AND THE ARTIST NAMES FOR ALL THE
  // SONGS IN THE PLAYLIST

  const trackData = await spotifyApi.getPlaylistTracks(playlistId);

  // console.log(JSON.stringify(trackData, null, 4));

  tracks = [];
  for (let song of trackData.body.items) {
    if (!song.track.album.images[0]) {
      // IF THE SONG HAS BEEN REMOVED BY SPOTIFY, WE FLAG IT BY SETTING IT'S IMAGE TO THE SPOTIFY LOGO
      tracks.push([song.track.name, "Spotify_App_Logo.svg.png", []]);
    } else {
      tracks.push([song.track.name, song.track.album.images[0].url, []]);
    }
    for (let artist of song.track.artists) {
      tracks[tracks.length - 1][2].push(artist.name);
    }
  }

  // console.log(tracks);
  console.log(playlistName, playlistId);
  res.render("MyPlaylistTracks", {
    playlistImg: playlistImg,
    playlistName: playlistName,
    tracks: tracks,
    email: currentUserEmail 
  });
});

// CONVERTING AN ENTIRE SPOTIFY PLAYLIST TO YOUTUBE
app.post("/convertPlaylistToYoutube", async function (req, res) {
  const {playlistName, playlistImg} = req.body;
  const currentUserEmail = req.body.emailFeedback;
  const tracks = JSON.parse(req.body.tracksFeedback);
  let youtubePlaylist = [];
  let flag = 0;
  // console.log(tracks);

  // TO CHECK IF THE USER HAS ALREADY CONVERTED THE PLAYLIST BEFORE
  await User.findOne({ email: currentUserEmail }).then((user) => {
    user.convertedPlaylists.forEach((playlist) => {
      if (playlist[0][1] === playlistName) {
        youtubePlaylist = playlist;
        flag = 1;
        console.log("Not calling Youtube API");
      }
    });
  });

  // MAKING THE API CALL IF THE PLAYLIST HAS NOT BEEN CONVERTED BEFORE
  if (flag === 0) {
    youtubePlaylist.push([playlistImg, playlistName]);

    for (const track of tracks) {
      if (track[1] === "Spotify_App_Logo.svg.png") {
        continue;
      }
      try {
        const response = await youtube.search.list({
          key: youtubeKey,
          part: "snippet",
          q: track[0] + " " + track[2][0],
        });

        const url = `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
        const videoName = response.data.items[0].snippet.title;
        const channelTitle = response.data.items[0].snippet.channelTitle;
        const thumbnail = response.data.items[0].snippet.thumbnails.high.url;
        youtubePlaylist.push([
          url,
          videoName,
          channelTitle,
          thumbnail,
          track[0],
        ]);
      } catch (err) {
        console.error(err);
      }
    }

    // console.log(youtubePlaylist);

    // ADDING THE CONVERTED PLAYLIST TO THE ARRAY OF CONVERTED PLAYLISTS IN THE USER'S DOCUMENT
    // IN THE DATABASE
    await User.findOneAndUpdate(
      { email: currentUserEmail },
      { $push: { convertedPlaylists: youtubePlaylist } }
    );
  }

  res.render("MyConvertedPlaylistTracks", { youtubePlaylist: youtubePlaylist, email: currentUserEmail });
});

// CONVERTING A SPECIFIC SONG TO YOUTUBE
app.post("/convertTrackToYoutube", async function (req, res) {
  const {songName, artistName, playlistName} = req.body; 
  const currentUserEmail = req.body.emailFeedback;
  
  let flag = 0;
  var videoID = "";

  // CHECKING IF THE SPOTIFY PLAYLIST CONTAINING THE SONG HAS BEEN CONVERTED BEFORE
  const user = await User.findOne({ email: currentUserEmail });
  user.convertedPlaylists.forEach((playlist) => {
    // IF IT HAS BEEN CONVERTED BEFORE, THEN THE VIDEO ID IS RETRIEVED FROM THE ARRAY
    if (playlist[0][1] === playlistName) {
      playlist.slice(1).forEach((song) => {
        if (song[4] === songName) {
          flag = 1;
          console.log("Not Calling API");
          videoID = song[0].split("=")[1];
        }
      });
    }
  });

  // MAKING THE API CALL IF THE PLAYLIST CONTAINING THE SONG HAS NOT BEEN CONVERTED BEFORE
  if (flag === 0) {
    await youtube.search
      .list({
        key: youtubeKey,
        part: "snippet",
        q: songName + " " + artistName,
      })
      .then((response) => {
        // console.log(JSON.stringify(response,null,4));
        console.log("Calling API");
        videoID = response.data.items[0].id.videoId;
        console.log(videoID);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  res.render("ConvertedYoutubeSongs", { videoID: videoID });
});

// DISPLAYING SONGS FROM AN EXTERNAL PLAYLIST
app.post("/externalPlaylist", async function (req, res) {
  // THE USER ENTERS THE URL AND WE NEED TO RETRIEVE THE PLAYLIST ID FROM THE URL
  const currentUserEmail = req.body.emailFeedback;
  const playlistURL = req.body.playlistLink;
  // PERFORM STRING SPLITTING USING REGEX
  const parts = playlistURL.split(/[/?]/);

  // THE ID IS ALWAYS PRESENT AFTER THE WORD "playlist" IN THE URL
  const playlistIndex = parts.findIndex((part) => part === "playlist");

  const playlistID = parts[playlistIndex + 1];

  // OBTAINING THE PLAYLIST NAME AND IMAGE
  spotifyApi
    .getPlaylist(playlistID)
    .then(async (playlistData) => {
      const playlistName = playlistData.body.name;
      const playlistImg = playlistData.body.images[0].url;

      const trackData = await spotifyApi.getPlaylistTracks(playlistID);

      // console.log(JSON.stringify(trackData, null, 4));

      tracks = [];
      for (let song of trackData.body.items) {
        if (!song.track.album.images[0]) {
          tracks.push([song.track.name, "Spotify_App_Logo.svg.png", []]);
        } else {
          tracks.push([song.track.name, song.track.album.images[0].url, []]);
        }
        for (let artist of song.track.artists) {
          tracks[tracks.length - 1][2].push(artist.name);
        }
      }

      // console.log(tracks);
      console.log(playlistName, playlistID);
      res.render("MyPlaylistTracks", {
        playlistImg: playlistImg,
        playlistName: playlistName,
        tracks: tracks,
        email: currentUserEmail
      });
    })
    .catch((err) => {
      console.error(err);
      if(err.statusCode === 404){
        res.render("welcome", {
          profilePic: req.body.profilePicFeedback,
          name: req.body.nameFeedback,
          error: err.body.error.message,
          email: req.body.emailFeedback
        });
      } else if(err.statusCode === 403) {
        res.json(`${err.statusCode} Not Authorized. Request access if you are a first time user`)
      }
    });
});

app.listen(process.env.PORT || 3000, () =>
  console.log(
    "HTTP Server up. Now go to http://localhost:3000 in your browser."
  )
);
