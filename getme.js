const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const token = "BQA7C8UIzddXWlKWVXfibEuM00VtIPEsgK1HwSCrys0R0z6vBLpF6JIunrEbHSd1iElYoMWABBTKkcHzbGYWd3SQeQRGYwpqq0uRaKaPXeep-49JxVM6tTpZVFuv2hDT_EpnPd4s6e5YrJpwPtE-ZwZ4RAUoxnuHHto0Ukb9nmiailFmZ-6qE170en613qW5MJc-ahI-bGOPRXDYJYAvDRwPhXSXdRyrmREe0t4MBM6tpCI2djmxFFHAv_FuK_WZkxklfgcb38HYOI-Lewh24yFoBzbMqmbhldkBQ0mOq-RpNNWcPTTxmPpftqr0buKSnvINLk5yycUMsA07Eaxe";

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