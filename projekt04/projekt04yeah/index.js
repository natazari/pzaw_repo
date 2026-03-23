import express from "express";
import morgan from "morgan";
import collections from "./models/collections.js";

const port = 8000;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());

app.use(morgan("dev"));

app.get("/collections", (req, res) => {
  res.render("collections", {
    title: "Kolekcje!!!",
    collections: collections.getCollectionSummaries(),
  });
});


//co z /view /???????
app.get("/collections/view/:collection_id", (req, res) => {
  const collection = collections.getCollection(req.params.collection_id);
  if (collection != null) {
    res.render("collection", {
      title: collection.name,
      collection,
    });
  } else {
    res.sendStatus(404);
  }
});


app.get("/artists/:artist_id", (req, res)=>{
  const artist = collections.getArtist(req.params.artist_id);

  if(artist !=null){
    res.render("artist", {
      title: artist.artist_name,
      artist,
    });
  }else{
    res.sendStatus(404);
  }
});

app.get("/collections/new_collection", (req, res) => {
  res.render("collection_new", {
    title: "Nowa kolekcja",
  });
});

app.post("/collections/new_collection", (req, res) => {
  const collection_name = req.body.name;
  var collection_id = null;
  var errors = collections.validateCollectionOrArtistName(collection_name);
  if (errors.length == 0) {
    collection_id = collections.generateCollectionOrArtistId(collection_name);
    if (collections.hasCollection(collection_id)) {
      errors.push("Collection id is already taken");
    }
  }

  if (errors.length == 0) {
    flashcards.addCollection(collection_id, collection_name);
    res.redirect(`/collections/view/${collection_id}`);
  } else {
    res.status(400);
    res.render("collection_new", {
      errors,
      title: "Nowa kolekcja",
      name: collection_name,
    });
  }
});

app.get("/collections/:collection_id/artists", (req, res) => {
  res.render("artist_new", {
    title: "Nowy artysta",
  });
});

app.post("/collections/:collection_id/artists", (req, res) => {
  const collection_id = req.params.collection_id;
  const artist_name = req.body.artist_name;
  var errors = collections.validateCollectionOrArtistName(artist_name);
  // if (errors.length == 0) {
  //   artist_id = artists.generateCollectionOrArtistId(artist_name);
  //   if (collections.hasArtist(artist_id)) {
  //     errors.push("artist id is already taken");
  //   }
  // }

  if (errors.length == 0) {
    collections.addArtist(collection_id, { artist_name });
    res.redirect(`/collections/${collection_id}`);
  } else {
    res.status(400);
    res.render("artist_new", {
      errors,
      title: "Nowy artysta",
      name: artist_name,
      collection_id
    });
  }
});

app.post("/artists/:artist_id/add_song", (req, res) => {
  const artist_id = req.params.artist_id;

  if (!collections.hasArtist(artist_id)) {
    return res.sendStatus(404);
  }

  const song_data = {
    song_name: req.body.song_name,
    album: req.body.album,
  };

  const errors = collections.validateSongData(song_data);

  if (errors.length === 0) {
    collections.addSong(artist_id, song_data);
    return res.redirect(`/artists/${artist_id}`);
  }

  res.status(400);
  res.render("new_song", {
    errors,
    title: "Nowa piosenka",
    song_name: req.body.song_name,
    album: req.body.album,
    artist: {
      id: artist_id,
    },
  });
});




app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
