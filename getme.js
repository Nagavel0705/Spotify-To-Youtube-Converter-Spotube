const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
let token; // = "BQC9hEZB5hIwrdL3ZeCJREq8oGAgYWe2yNwZ4xElpcn4EqjrlkOQXLSTvABRjfJwd7oVzdwawUo_yWvreKwqtswT8Hc-TZzXbKKQD-UlNpgwcqFvL_bYjwbLWAdDmyIgipoCp5IaTgGZJT3e92DjU_H8kKJh1vjFQWLVDVbt843qx4w6wmgDiQepexYXdA3_cM6T8pU3BjhjcpOTD04FmeK-AzSErvf84mFRcSBYlcKA09PIN2beghZA5kQH8H_22iEKqf7LEOuGNNg5BGXbFbxR5WyccV0ZGrvR-YL4gShdLE4FEgEnzLgJPFbnVYF_HvOYdKvCzxIS3VB8bimJ";
const spotifyApi = new SpotifyWebApi();

function readOutputFile() {
  const output = fs.readFileSync('output.txt', 'utf8');
  return output;
}

token = readOutputFile();
console.log(token);
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

// GET SONGS FROM PLAYLIST
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