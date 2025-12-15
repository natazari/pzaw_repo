import { DatabaseSync } from "node:sqlite";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);

console.log("Creating database tables");
db.exec(
  `


  CREATE TABLE IF NOT EXISTS collections_tb (
    collection_id   INTEGER PRIMARY KEY,
    id            TEXT UNIQUE NOT NULL,
    artist          TEXT NOT NULL,
    genre          TEXT NOT NULL
  ) STRICT;
  CREATE TABLE IF NOT EXISTS songs_tb (
    id            INTEGER PRIMARY KEY,
    collection_id   INTEGER NOT NULL REFERENCES collections_tb(collection_id) ON DELETE CASCADE,
    song_name         TEXT NOT NULL,
    album         TEXT NOT NULL
  ) STRICT;`
);
const db_ops = {
  insert_collection: db.prepare(
    `INSERT INTO collections_tb (id, artist, genre)
        VALUES (?, ?, ?) RETURNING collection_id, id, artist, genre;`
  ),
  insert_song: db.prepare(
    `INSERT INTO songs_tb (collection_id , song_name, album) 
        VALUES (?, ?, ?) RETURNING id, song_name, album;`
  ),
    insert_song_by_id: db.prepare(
    `INSERT INTO songs_tb (collection_id, song_name, album) VALUES (
      (SELECT collection_id FROM collections_tb WHERE id = ?),
      ?, 
      ?
    ) 
    RETURNING id, song_name, album;`
  ),
  get_collections: db.prepare("SELECT id, artist, genre FROM collections_tb;"),
  get_collection_by_id: db.prepare(
    "SELECT collection_id, id, artist, genre FROM collections_tb WHERE id = ?;"
  ),
  get_songs_by_collection_id: db.prepare(
    "SELECT id, song_name, album FROM songs_tb WHERE collection_id = ?;"
  ),
};


export function getCollectionSummaries() {
  // return Object.entries(collections).map(([id, collection]) => {
  //   return { 
  //     id, 
  //     name: id, 
  //     artist: collection.artist, 
  //     genre: collection.genre  
  //   };
  // });
    var collections = db_ops.get_collections.all();
  console.log("getCollectionSummaries RETURNED:", collections);
  
  return collections;
  
}
export function getCollection(collectionId){
//   if (collections.hasOwnProperty(collection_id)) {
//     return {
//         ...collections[collection_id],
//         id: collection_id,
//         name: collection_id  
//     };
// }return null

  let collection = db_ops.get_collection_by_id.get(collectionId);
  if (collection != null) {
    collection.songs = db_ops.get_songs_by_collection_id.all(collection.collection_id);
    return collection;
  }
  return null;
};

export function hasCollection(collectionId) {
  // return collections.hasOwnProperty(collectionId);
  let collection = db_ops.get_collection_by_id.get(collectionId);
  return collection != null;
};

export function addSong(collectionId, song) {
  // if (hasCollection(collectionId)) collections[collectionId].songs.push(song);
  return db_ops.insert_song_by_id.get(collectionId, song.song_name, song.album);
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
};
export function addCollection(collectionId, artist, genre) {
  return db_ops.insert_collection.get(collectionId, artist, genre);
};

export default {
  getCollectionSummaries,
  getCollection,
  addSong,
  addCollection,
  hasCollection,
  validateSongData
};
