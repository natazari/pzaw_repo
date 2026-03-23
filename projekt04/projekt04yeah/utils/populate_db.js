import collections from "../models/collections.js";

const collections_list = {
  "Metal": {
    artists: [
      {
        artist: "Megadeth",
        songs: [
          { song_name: "Holy wars", album: "Rust In Peace" },
          { song_name: "Peace Sells", album: "Peace Sells... But Whos Buying?" },
          { song_name: "Youthanasia", album: "Youthanasia" },
        ],
      },
      {
        artist: "Pantera",
        songs: [
          { song_name: "A new level", album: "Vulgar Display of Power" },
          { song_name: "Walk", album: "Vulgar Display of Power" },
          { song_name: "This Love", album: "Vulgar Display of Power" },
        ],
      },
    ],
  },

  "Operation Ivy": {
    artists: [
      {
        artist: "Operation Ivy",
        songs: [
          { song_name: "Bombshell", album: "Operation Ivy" },
          { song_name: "Sound System", album: "Operation Ivy" },
        ],
      },
    ],
  }
};

console.log("Populating db...");

// Object.entries(collections_list).forEach(([id, data]) => {
//   let collection = collections.addCollection(id, data.artist);
//   console.log("Created collection:", collection);

//   let artist = collections.addArtist(collection.id, {
//     artist_name: data.artist,
//   });
//   console.log("Created artist:", artist);

//   for (let song of data.songs) {
//     let s = collections.addSong(artist.id, song);
//     console.log("Created song:", s);
//   }
// });

Object.entries(collections_list).forEach(([id, data]) => {
  let collection = collections.addCollection(id, id);
  console.log("Created collection:", collection);

  for (let artistData of data.artists) {
    let artist = collections.addArtist(collection.id, {
      artist_name: artistData.artist,
    });
    console.log("Created artist:", artist);

    for (let song of artistData.songs) {
      let s = collections.addSong(artist.id, song);
      console.log("Created song:", s);
    }
  }
});