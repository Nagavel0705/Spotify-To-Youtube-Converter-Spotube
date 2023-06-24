const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const token = "BQCjyws_78gKl2WAcUsP6iDAAdT7thqwxfbfL_QenGCjjRpyvH_asiyiILEfWp4Z6BlehENOk5RdQdxKZjbpUslQrVqYyiirWXbIxnHf5cn1qte22mVCAbFL5_vCLhP1fhjGShvevzEU9O8_8acD1Fq87WzxjeXJqBZMk-IlsToCqC5e40HtyAVMOtkqnNLTmM3VKMA9RYZ4oRK5I_px5HByHS0nwbY6SWFvyltKgAm3evruAl5vdVGSsyT2i9OdCb2FAGXL-koqePAqJYTkxVPN-5cNCCbttRiZCXNaPOjo6mmNY_dZD4By7QYWxg8v4t2h7OkG1q0A0kXPt_y6";

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