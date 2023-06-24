const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const token = "BQCQxVXlmb76OL7HvLYUwoLf2xTmMKqeVoQAThFCYCHZBuG8rMwxdgKlmy9yz6hKRMiliH_ZCtDiGEDy1plyrXieHscfOMqDomZrB-KAIlB83CMXsZJcjpBwxNRQqAvMc-9yHsLniIeIYCjBBNyZO7xOxSYulHsW91us9Vdk_L9eHrICWzoNWNg6JwYhCrDNXF8rce4FWQGLqksVFMvUjlB3iAS8LYPiEG70VxOAWAO6mDuGZxNlSTkxBnk_SIAtJ6NpMvZaMDl5OWJa8BMeyeUsbaCkKS9v2w6aAB-J8ZP8Qx-aA-k1-F9qkdZelGqu0esH_9egQT3wrQ2aSR_I";
const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(token);

//GET MY PROFILE DATA
function getMyData() {
  (async () => {
    const me = await spotifyApi.getMe();
    // console.log(me.body);
    getUserPlaylists(me.body.id);
  })().catch(e => {
    console.error(e);
  });
}

//GET MY PLAYLISTS
async function getUserPlaylists(userName) {
  const data = await spotifyApi.getUserPlaylists(userName)

  console.log("---------------+++++++++++++++++++++++++")
  let playlists = []

  for (let playlist of data.body.items) {
    console.log("Name: " + playlist.name + "\nId: " + playlist.id + "\n\n")
    
    // let tracks = await getPlaylistTracks(playlist.id, playlist.name);
    // console.log(tracks);

    // const tracksJSON = { tracks }
    // let data = JSON.stringify(tracksJSON);
    // fs.writeFileSync(playlist.name+'.json', data);
  }
}

//GET SONGS FROM PLAYLIST
// async function getPlaylistTracks(playlistId, playlistName) {

//   const data = await spotifyApi.getPlaylistTracks(playlistId, {
//     offset: 1,
//     limit: 100,
//     fields: 'items'
//   })

//   // console.log('The playlist contains these tracks', data.body);
//   // console.log('The playlist contains these tracks: ', data.body.items[0].track);
//   // console.log("'" + playlistName + "'" + ' contains these tracks:');
//   let tracks = [];

//   for (let track_obj of data.body.items) {
//     const track = track_obj.track
//     tracks.push(track);
//     console.log(track.name + " : " + track.artists[0].name)
//   }
  
//   console.log("---------------+++++++++++++++++++++++++")
//   return tracks;
// }

getMyData();