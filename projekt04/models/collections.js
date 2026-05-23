import { DatabaseSync } from "node:sqlite";

const db_path = "./db.sqlite";
const db = new DatabaseSync(db_path);

db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS cl_users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  passhash TEXT NOT NULL,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS cl_collections (
  collection_id INTEGER PRIMARY KEY,
  id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES cl_users(id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS cl_artists (
  id INTEGER PRIMARY KEY,
  collection_id INTEGER NOT NULL REFERENCES cl_collections(collection_id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cl_songs (
  id INTEGER PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES cl_artists(id) ON DELETE CASCADE,
  song_name TEXT NOT NULL,
  album TEXT NOT NULL
);
`);

const db_ops = {
  insert_collection: db.prepare(
    "INSERT INTO cl_collections (id, name, author_id) VALUES ($id, $name, $author_id);"
  ),
  update_collection_by_id: db.prepare(
    "UPDATE cl_collections SET id = $new_id, name = $new_name WHERE id = $id;"
  ),
  get_collections: db.prepare(
    "SELECT id, name, author_id FROM cl_collections WHERE author_id = $author_id;"
  ),
  get_collection_by_id: db.prepare(
    "SELECT collection_id, id, name, author_id FROM cl_collections WHERE id = $id;"
  ),
  insert_artist: db.prepare(
    "INSERT INTO cl_artists (collection_id, artist_name) VALUES ($collection_id, $artist_name);"
  ),
  get_artist_by_id: db.prepare(
    "SELECT id, collection_id, artist_name FROM cl_artists WHERE id = $id;"
  ),
  get_artists_by_collection: db.prepare(
    "SELECT id, collection_id, artist_name FROM cl_artists WHERE collection_id = $collection_id;"
  ),
  update_artist: db.prepare(
    "UPDATE cl_artists SET artist_name = $artist_name WHERE id = $id;"
  ),
  delete_artist: db.prepare(
    "DELETE FROM cl_artists WHERE id = $id;"
  ),
  insert_song: db.prepare(
    "INSERT INTO cl_songs (artist_id, song_name, album) VALUES ($artist_id, $song_name, $album);"
  ),
 get_song_by_id: db.prepare(
  "SELECT id, artist_id, song_name, album FROM cl_songs WHERE id = $id;"
),
  get_songs_by_artist: db.prepare(
    "SELECT id, song_name, album FROM cl_songs WHERE artist_id = $artist_id;"
  ),
  update_song: db.prepare(
    "UPDATE cl_songs SET song_name = $song_name, album = $album WHERE id = $id;"
  ),
  delete_song: db.prepare(
    "DELETE FROM cl_songs WHERE id = $id;"
  ),
  get_collection_by_pk: db.prepare(
  "SELECT collection_id, id, name, author_id FROM cl_collections WHERE collection_id = $pk;"
)
};
// Show all collections publicly, but you could filter by user_id here if needed
export function getCollectionSummaries() {
  return db.prepare("SELECT id, name, author_id FROM cl_collections").all();
}

export function canEditArtist(artistId, user) {
  const artist = db_ops.get_artist_by_id.get({ $id: artistId });
  if (!artist) return false;
  const collection = db_ops.get_collection_by_pk.get({ $pk: artist.collection_id });
  if (!collection) return false;
  return user != null && (collection.author_id === user.id || user.is_admin);
}

export function getCollection(id) {
  const collection = db_ops.get_collection_by_id.get({ $id: id });
  if (!collection) return null;
  collection.artists = db_ops.get_artists_by_collection.all({
    $collection_id: collection.collection_id,
  });
  collection.editableBy = collectionEditableBy;
  return collection;
}

export function addCollection(id, name, user) {
  db_ops.insert_collection.run({
    $id: id,
    $name: name,
    $author_id: user.id,
  });
  return getCollection(id);
}

export function hasCollection(id) {
  return db_ops.get_collection_by_id.get({ $id: id }) != null;
}

export function updateCollection(id, newId, newName) {
  db_ops.update_collection_by_id.run({
    $id: id,
    $new_id: newId,
    $new_name: newName,
  });
  return getCollection(newId);
}

function collectionEditableBy(user) {
  return user != null && (this.author_id === user.id || user.is_admin);
}

export function canEdit(collectionId, user) {
  const collection = getCollection(collectionId);
  if (!collection) return false;
  return collection.editableBy(user);
}

export function addArtist(collectionId, artist) {
  const collection = getCollection(collectionId);
  db_ops.insert_artist.run({
    $collection_id: collection.collection_id,
    $artist_name: artist.artist_name,
  });
  const artists = db_ops.get_artists_by_collection.all({
    $collection_id: collection.collection_id,
  });
  return artists[artists.length - 1];
}
// export function canEditArtist(artistId, user) {
//   const artist = db_ops.get_artist_by_id.get({ $id: artistId });
//   if (!artist) return false;

//   const collection = getCollection(artist.collection_id);
//   if (!collection) return false;

//   return user != null && (collection.author_id === user.id || user.is_admin);
// }
export function getArtist(id) {
  const artist = db_ops.get_artist_by_id.get({ $id: id });
  if (!artist) return null;
  artist.songs = db_ops.get_songs_by_artist.all({
    $artist_id: artist.id,
  });
  return artist;
}

export function updateArtist(artist) {
  db_ops.update_artist.run({
    $id: artist.id,
    $artist_name: artist.artist_name,
  });
  return getArtist(artist.id);
}

export function deleteArtistById(id) {
  db_ops.delete_artist.run({ $id: id });
}

export function hasArtist(id) {
  return db_ops.get_artist_by_id.get({ $id: id }) != null;
}

export function addSong(artistId, song) {
  db_ops.insert_song.run({
    $artist_id: artistId,
    $song_name: song.song_name,
    $album: song.album,
  });
  const songs = db_ops.get_songs_by_artist.all({
    $artist_id: artistId,
  });
  return songs[songs.length - 1];
}

export function updateSong(song) {
  db_ops.update_song.run({
    $id: song.id,
    $song_name: song.song_name,
    $album: song.album,
  });
  return getSong(song.id);
}

export function getSong(id) {
  return db_ops.get_song_by_id.get({ $id: id });
}

export function deleteSongById(id) {
  db_ops.delete_song.run({ $id: id });
}

export function hasSong(id) {
  return db_ops.get_song_by_id.get({ $id: id }) != null;
}

export function validateCollectionOrArtistName(name) {
  const errors = [];
  if (typeof name !== "string") errors.push("Name must be string");
  else if (name.length < 1 || name.length > 100) errors.push("Name must be 1-100 chars");
  return errors;
}

export function validateSongData(song) {
  const errors = [];
  for (const field of ["song_name", "album"]) {
    if (!song[field]) errors.push(`Missing field '${field}'`);
    else if (typeof song[field] !== "string") errors.push(`'${field}' must be string`);
    else if (song[field].length < 1 || song[field].length > 500) errors.push(`'${field}' length 1-500`);
  }
  return errors;
}

export function generateCollectionId(name) {
  return name.toLowerCase().replace(/(\s|[.-])+/g, "-").replace(/[^a-z0-9.-]/g, "");
}

export default {
  getCollectionSummaries,
  getCollection,
  addCollection,
  hasCollection,
  updateCollection,
  canEdit,
  addArtist,
  getArtist,
  updateArtist,
  deleteArtistById,
  hasArtist,
  addSong,
  updateSong,
  getSong,
  deleteSongById,
  hasSong,
  validateCollectionOrArtistName,
  validateSongData,
  generateCollectionId,
  canEditArtist
};