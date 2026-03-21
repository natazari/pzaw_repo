import { DatabaseSync } from "node:sqlite";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);
db.exec("PRAGMA foreign_keys = ON;");
db.exec(
  `CREATE TABLE IF NOT EXISTS cl_collections (
    collection_id   INTEGER PRIMARY KEY,
    id            TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL
  ) STRICT;
  CREATE TABLE IF NOT EXISTS cl_artists (
    id            INTEGER PRIMARY KEY,
    collection_id   INTEGER NOT NULL REFERENCES cl_collections(collection_id) ON DELETE NO ACTION,
    artist_name         TEXT NOT NULL
    
  ) STRICT;
   CREATE TABLE IF NOT EXISTS cl_songs (
    id            INTEGER PRIMARY KEY,
    artist_id   INTEGER NOT NULL REFERENCES cl_artists(id) ON DELETE NO ACTION,
    song_name         TEXT NOT NULL,
    album         TEXT NOT NULL
  ) STRICT;`
 
);

const db_ops = {
  insert_collection: db.prepare(
    "INSERT INTO cl_collections (id, name) VALUES (?, ?) RETURNING collection_id, id, name;"
  ),
  update_collection_by_id: db.prepare(
    "UPDATE cl_collections SET id = $new_collection_id, name = $name WHERE id = $collection_id RETURNING collection_id, id, name;"
  ),
  insert_artist: db.prepare(
    "INSERT INTO cl_artists(collection_id, artist_name) VALUES (?, ?) RETURNING id, collection_id, artist_name;"
  ),
  update_artist_by_id: db.prepare(
    "UPDATE cl_artists SET id = $new_artist_id, artist_name = $artist_name WHERE id = $artist_id RETURNING id, collection_id, artist_name;"
  ),
  insert_song: db.prepare(
    "INSERT INTO cl_songs (artist_id, song_name, album) VALUES (?, ?, ?) RETURNING id, song_name, album;"
  ),
  // insert_song_by_artist_id: db.prepare(
  //   `INSERT INTO cl_songs (artist_id, song_name, album) VALUES (
  //     (SELECT id FROM cl_artists WHERE id = ?),
  //     ?, 
  //     ?
  //   ) 
  //   RETURNING id, song_name, album;`
  // ) //INSERT INTO cl_songs (artist_id, song_name, album) VALUES (?, ?, ?) ?????
  insert_song_by_artist_id: db.prepare(
  "INSERT INTO cl_songs (artist_id, song_name, album) VALUES (?, ?, ?) RETURNING id, song_name, album;"
),
  
    insert_artist_by_collection_id: db.prepare(
    `INSERT INTO cl_artists (collection_id, artist_name) VALUES (
      (SELECT collection_id FROM cl_collections WHERE id = ?),
      ?
    ) 
    RETURNING id, artist_name;`
  ),
  get_collections: db.prepare("SELECT id, name FROM cl_collections;"),
  get_collection_by_id: db.prepare(
    "SELECT collection_id, id, name FROM cl_collections WHERE id = ?;"
  ),

  get_artists: db.prepare("SELECT id, collection_id, artist_name FROM cl_artists;"),
  get_artist_by_id: db.prepare(
    "SELECT collection_id, id, artist_name FROM cl_artists WHERE id = ?;"
  ),
  get_artist_by_collection_id: db.prepare(
  "SELECT id, collection_id, artist_name FROM cl_artists WHERE collection_id = ?;"
),
  delete_artist_by_id: db.prepare(
  "DELETE FROM cl_artists WHERE id = ?;"
),

  get_song_by_id: db.prepare(
    "SELECT id, song_name, album FROM cl_songs WHERE id = ?;"
  ),
  update_song_by_id: db.prepare(
    "UPDATE cl_songs SET song_name = ?, album = ? WHERE id = ? RETURNING id, song_name, album;"
  ),
  delete_song_by_id: db.prepare("DELETE FROM cl_songs WHERE id = ?;"),
  get_songs_by_artist_id: db.prepare(
    "SELECT id, song_name, album FROM cl_songs WHERE artist_id = ?;"
  ),
};

export function getCollectionSummaries() {
  var collections = db_ops.get_collections.all();
  return collections;
}

export function getArtistSummaries() {
  var artists = db_ops.get_artists.all();
  return artists;
}

export function hasCollection(collectionId) {
  let collection = db_ops.get_collection_by_id.get(collectionId);
  return collection != null;
}
export function hasArtist(artistId) {
  let artist = db_ops.get_artist_by_id.get(artistId);
  return artist != null;
}

export function hasSong(songId) {
  let artist = db_ops.get_song_by_id.get(songId);
  return artist != null;
}

export function getCollection(collectionId) {
  let collection = db_ops.get_collection_by_id.get(collectionId);
  if (collection != null) {
    collection.artists = db_ops.get_artist_by_collection_id.all(collection.collection_id);
    return collection;
  }
  return null;
}
export function getArtist(artistId) {
  let artist = db_ops.get_artist_by_id.get(artistId);
  if (artist != null) {
    artist.songs = db_ops.get_songs_by_artist_id.all(artist.id);
    return artist;
  }
  return null;
}

export function addSong(artistId, song) {
  return db_ops.insert_song_by_artist_id.get(
    artistId,
    song.song_name,
    song.album
  );
}

export function updateSong(song) {
  return db_ops.update_song_by_id.get(song.song_name, song.album, song.id);
}

export function deleteSongById(songId) {
  return db_ops.delete_song_by_id.run(songId);
}


export function addArtist(collectionId, artist) {
  return db_ops.insert_artist_by_collection_id.get(
    collectionId,
    artist.artist_name
  );
}

export function updateArtist(artist) {
  return db_ops.update_artist_by_id.get({
  $new_artist_id: artist.id,
  $artist_name: artist.artist_name,
  $artist_id: artist.id
});
}

export function deleteArtistById(artistId) {
  return db_ops.delete_artist_by_id.run(artistId);
}

export function addCollection(collectionId, name) {
  return db_ops.insert_collection.get(collectionId, name);
}


// export function updateCollection(collectionId, newCollectionId, name) {
//   return db_ops.update_collection_by_id.get({
//     $collection_id: collectionId,
//     $new_collection_id: newCollectionId,
//     $name: name,
//   });
// }

export function validateSongData(song) {
  var errors = [];
  var fields = ["song_name", "album"];
  for (let field of fields) {
    if (!song.hasOwnProperty(field)) errors.push(`Missing field '${field}'`);
    else {
      if (typeof song[field] != "string")
        errors.push(`'${field}' expected to be string`);
      else {
        if (song[field].length < 1 || song[field].length > 500)
          errors.push(`'${field}' expected length: 1-500`);
      }
    }
  }
  return errors;
};
export function validateCollectionName(name) {
  var errors = [];
  if (typeof name != "string") {
    errors.push("Collection name should be a string");
  } else {
    if (name.length < 1 || name.length > 100) {
      errors.push("Collection name should have 1-100 characters");
    }
  }

  return errors;
};
export function validateArtistName(name) {
  var errors = [];
  if (typeof name != "string") {
    errors.push("Artist name should be a string");
  } else {
    if (name.length < 2 || name.length > 100) {
      errors.push("Artist name should have 2-100 characters");
    }
  }

  return errors;
}

export function generateCollectionId(name) {
  const collectionId = name
    .toLowerCase()
    .replace(/(\s|[.-])+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");

  return collectionId;
}

export default {
  getCollectionSummaries,
  getArtistSummaries,
  getCollection,
  getArtist,
  hasCollection,
  hasArtist,
  hasSong,
  addCollection,
  addArtist,
  addSong,
  updateArtist,
  updateSong,
  deleteArtistById,
  deleteSongById,
  validateCollectionName,
  validateArtistName,
  generateCollectionId
};
