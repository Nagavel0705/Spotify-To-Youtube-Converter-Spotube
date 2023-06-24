const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const token = "BQB-SqhzN4bloTinhPWpykiwhO4dJRwcjM83y-PzV3XiVRzknI5bvK1Se7YURGHLf3lmHBLxvif9HP7qObkTfQsrF7oFcwsEgcVgA1Qf4O3_wecGytWb50vFCT0T_hMOfRYgsY3PkLaOHn1aLTV9nJqPm6Puw4Im1u33VK2VGVju756lXNwtAf3IPcYpPtZ5Ryka2VA-ORhKXuQ8HQBGrzTqvaBpWL7EQgq7AJJnGoW2pVSiN71biaqSCPfUJsAnzD2sJq4GxEJlp5_DmrsaEJ9HnPG5bpuCSbIpNRyL81qoHk2QxQTZ1zBjBdO9k1semqf5f9XaMDKZPtn0PXBU";

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