const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const SpotifyWebApi = require("spotify-web-api-node");
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/spotifyDB");

let global_email = ""; // STORING THE CURRENT USER'S EMAIL GLOBALLY FOR ACCESS IN ALL ROUTES

const User = mongoose.model("User", {
  email: String,
  id: String,
  accessToken: String,
  refreshToken: String,
});

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
];

const spotifyApi = new SpotifyWebApi({
  redirectUri: "http://localhost:3000/callback",
  clientId: process.env.clientID,
  clientSecret: process.env.clientSecret,
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
  const state = req.query.state;

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then(async (data) => {
      // console.log(data);
      const access_token = data.body["access_token"];
      const refresh_token = data.body["refresh_token"];
      const expires_in = data.body["expires_in"];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );

      try {
        const me = await spotifyApi.getMe();

        global_email = me.body.email;

        console.log(me);

        const user = new User({
          email: global_email,
          id: me.body.id,
          accessToken: access_token,
          refreshToken: refresh_token,
        });

        user.save();

        res.render("welcome", { name: me.body["display_name"] });
      } catch (e) {
        console.error(e);
      }

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body["access_token"];

        console.log("The access token has been refreshed!");
        console.log("access_token:", access_token);
        spotifyApi.setAccessToken(access_token);

        await User.findOneAndUpdate(
          { email: global_email },
          { accessToken: access_token }
        );
      }, 3500000);
    })
    .catch((error) => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

app.post("/myPlaylists", async function (req, res) {

  const user = await User.findOne({ email: global_email });

  const data = await spotifyApi.getUserPlaylists(user.id);

  console.log("---------------+++++++++++++++++++++++++");
  let playlists = [];

  console.log(data);

  for (let playlist of data.body.items) {
    playlists.push(playlist.name);
    console.log("Name: " + playlist.name + "\nId: " + playlist.id + "\n\n");
  }

  res.render("MyPlaylists", { playlists: playlists });
});

app.listen(3000, () =>
  console.log(
    "HTTP Server up. Now go to http://localhost:3000 in your browser."
  )
);
