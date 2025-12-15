const collections = {
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

export function getCollectionSummaries() {
  return Object.entries(collections).map(([id, collection]) => {
    return { 
      id, 
      name: id, 
      artist: collection.artist, 
      genre: collection.genre  
    };
  });
}
export function getCollection(collection_id){
  if (collections.hasOwnProperty(collection_id)) {
    return {
        ...collections[collection_id],
        id: collection_id,
        name: collection_id  
    };
}return null
};

export function hasCollection(collectionId) {
  return collections.hasOwnProperty(collectionId);
};
export function addSong(collectionId, song) {
  if (hasCollection(collectionId)) collections[collectionId].songs.push(song);
};

export function validateSongData(song) {
  var errors = [];
  var fields = ["song_name", "album"];
  for (let field of fields) {
    if (!song.hasOwnProperty(field)) 
      errors.push(`Missing field '${field}'`);  
    else {
      if (typeof song[field] != "string")
        String(song[field]);
      else {
        if (song[field].length < 1 || song[field].length > 500)
          errors.push(`'${field}' expected length: 1-500`);
      }
    }
  }
  
  return errors;
;}

export default {
  getCollectionSummaries,
  getCollection,
  addSong,
  hasCollection,
  validateSongData
};