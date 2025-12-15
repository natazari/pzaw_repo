import collections from "../models/collection.js";

const collections_list = {
  "Megadeth": {
    artist: "Megadeth",
    genre: "metal",
    songs: [
      { song_name: "Holy wars", album: "Rust In Peace" },
      { song_name: "Peace Sells", album: "Peace Sells... But Whos Buying?" },
      { song_name: "Holy wars", album: "Rust In Peace" },
     { song_name: "Holy wars", album: "Rust In Peace" },
      { song_name: "Holy wars", album: "Rust In Peace" },
    ],
  },
  "Pantera": {
    artist: "Pantera",
    genre: "metal",
    songs: [
      { song_name: "A new level", album: "Vulgar Display of Power" },
      { song_name: "Peace Sells", album: "Vulgar Display of Power"  },
      { song_name: "Holy wars", album: "Vulgar Display of Power"  },
     { song_name: "Holy wars", album: "Rust In Peace" },
      { song_name: "Holy wars", album: "Rust In Peace" },
    ],
  },

    "Operation Ivy": {
    artist: "Operation Ivy",
    genre: "punk",
   songs: [
      { song_name: "Bombshell", album: "Operation Ivy" },
      { song_name: "Sound System", album: "Operation Ivy" },
      { song_name: "Caution", album: "Operation Ivy" },
     { song_name: "Crowd", album: "Operation Ivy" },
      { song_name: "Take Warning", album: "Operation Ivy" },
    ],
  },

    "Gee Tee": {
    artist: "Gee Tee",
    genre: "punk",
    songs: [
      { song_name: "Commando", album: "Chromo-zone" },
      { song_name: "FBI", album: "Chromo-zone" },
      { song_name: "Stuck Down", album: "Chromo-zone" }
    ],
  },
     "Dead Kennedys": {
    artist: "Dead Kennedys",
    genre: "punk",
    songs: [
      { song_name: "Buzzbomb", album: "Plastic Surgery Disasters" },
      { song_name: "Lets Lynch the Landlord", album: "Fresh Fruit for Rotting Vegetables" },
      { song_name: "Holiday in Cambodia", album: "Fresh Fruit for Rotting Vegetables" }
    ],
  }

};


console.log("Populating db...");

Object.entries(collections_list).map(([id, data]) => {
  let collection = collections.addCollection(id, data.artist, data.genre);
  console.log("Created collection:", collection);
  for (let song of data.songs) {
    let s = collections.addSong(collection.id, song);
    console.log("Created song:", s);
  }
});