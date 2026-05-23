import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import collections from "./models/collections.js";
import settings from "./models/settings.js";
import session from "./models/session.js";
import auth from "./controllers/auth.js";

const port = process.env.PORT || 8000;
const SECRET = process.env.SECRET;

if (SECRET == null) {
  console.error("SECRET environment variable missing. Please create an env file or provide SECRET via environment variables.");
  process.exit(1);
}

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());
app.use(morgan("dev"));
app.use(cookieParser(SECRET));

app.use(settings.settingsHandler);
app.use(session.sessionHandler);

function requireAuth(req, res, next) {
  if (!res.locals.user) {
    return res.redirect("/auth/login");
  }
  next();
}

const authRouter = express.Router();
authRouter.get("/signup", auth.signup_get);
authRouter.post("/signup", auth.signup_post);
authRouter.get("/login", auth.login_get);
authRouter.post("/login", auth.login_post);
authRouter.get("/logout", auth.logout);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.render("collections", {
    title: "Kolekcje",
    collections: collections.getCollectionSummaries(res.locals.user?.id)
  });
});

app.get("/collections", (req, res) => {
  res.render("collections", {
    title: "Kolekcje!!!",
    collections: collections.getCollectionSummaries(res.locals.user?.id)
  });
});

app.get("/collections/new_collection", requireAuth, (req, res) => {
  res.render("collection_new", {
    title: "Nowa kolekcja",
  });
});

app.get("/collections/edit/:collection_id", (req, res) => {
  const collection_id = req.params.collection_id;
  if (!collections.canEdit(collection_id, res.locals.user)) {
    return res.redirect("/collections/" + collection_id);
  }
  const collection = collections.getCollection(collection_id);
  if (!collection) return res.sendStatus(404);
  res.render("collection_edit", {
    errors: [],
    title: "Edycja kolekcji",
    collection,
  });
});

app.post("/collections/edit/:collection_id", (req, res) => {
  const collection_id = req.params.collection_id;
  if (!collections.canEdit(collection_id, res.locals.user)) {
    return res.sendStatus(403);
  }
  if (collections.hasCollection(collection_id)) {
    const collection_name = req.body.name;
    var new_collection_id = null;
    const errors = collections.validateCollectionOrArtistName(collection_name);
    if (errors.length == 0) {
      new_collection_id = collections.generateCollectionId(collection_name);
      if (new_collection_id !== collection_id && collections.hasCollection(new_collection_id)) {
        errors.push("collection id is already taken");
      }
    }
    if (errors.length == 0) {
      const collection = collections.updateCollection(collection_id, new_collection_id, collection_name);
      if (collection != null) {
        return res.redirect("/collections/" + collection.id);
      } else {
        res.status(500).send("Unexpected error while updating collection");
      }
    } else {
      const collection = collections.getCollection(collection_id);
      res.render("collection_edit", {
        errors,
        title: "Edycja kolekcji",
        collection,
      });
    }
  } else {
    res.sendStatus(404);
  }
});

app.get("/collections/artists/edit/:artist_id", (req, res) => {
  const artist_id = req.params.artist_id;
  if (!collections.canEditArtist(artist_id, res.locals.user)) {
    return res.redirect("/collections");
  }
  const artist = collections.getArtist(artist_id);
  res.render("artist_edit", {
    title: "Edycja artysty",
    artist,
    errors: [],
  });
});

app.post("/collections/artists/edit/:artist_id", (req, res) => {
  const artist_id = req.params.artist_id;
  if (!collections.canEditArtist(artist_id, res.locals.user)) {
    return res.redirect("/collections");
  }
  if (!collections.hasArtist(artist_id)) {
    return res.sendStatus(404);
  }
  const artist_name = req.body.name;
  const errors = collections.validateCollectionOrArtistName(artist_name);
  if (errors.length === 0) {
    collections.updateArtist({ id: artist_id, artist_name });
    return res.redirect(`/artists/${artist_id}`);
  }
  const artist = collections.getArtist(artist_id);
  res.status(400).render("artist", {
    errors,
    title: artist.artist_name,
    artist,
  });
});

app.post("/collections/artists/songs/edit/:artist_id/:song_id", requireAuth, (req, res) => {
  const artist_id = req.params.artist_id;
  const song_id = req.params.song_id;

  if (!collections.hasArtist(artist_id) || !collections.hasSong(song_id)) {
    return res.sendStatus(404);
  }
  if (!collections.canEditArtist(artist_id, res.locals.user)) {
    return res.sendStatus(403);
  }

  const song = {
    id: song_id,
    song_name: req.body.song_name,
    album: req.body.album,
  };

  const errors = collections.validateSongData(song);
  if (errors.length === 0) {
    collections.updateSong(song);
    return res.redirect(`/artists/${artist_id}`);
  }

  const artist = collections.getArtist(artist_id);
  res.status(400).render("artist", {
    errors,
    title: artist.artist_name,
    artist,
  });
});

app.post("/collections/artists/songs/delete/:artist_id/:song_id", requireAuth, (req, res) => {
  const artist_id = req.params.artist_id;
  const song_id = req.params.song_id;

  if (!collections.hasArtist(artist_id) || !collections.hasSong(song_id)) {
    return res.sendStatus(404);
  }
  if (!collections.canEditArtist(artist_id, res.locals.user)) {
    return res.sendStatus(403);
  }

  collections.deleteSongById(song_id);
  res.redirect(`/artists/${artist_id}`);
});

app.get("/collections/:collection_id", (req, res) => {
  const collection = collections.getCollection(req.params.collection_id);
  if (collection != null) {
    res.render("collection", {
      title: collection.name,
      collection,
      user: res.locals.user,
    });
  } else {
    res.sendStatus(404);
  }
});

app.get("/collections/:collection_id/artists/new", requireAuth, (req, res) => {
  const collection_id = req.params.collection_id;
  if (!collections.canEdit(collection_id, res.locals.user)) {
    return res.sendStatus(403);
  }
  res.render("artist_new", {
    title: "Nowy artysta",
    collection_id
  });
});

app.post("/collections/new_collection", requireAuth, (req, res) => {
  const collection_name = req.body.name;
  var collection_id = null;
  var errors = collections.validateCollectionOrArtistName(collection_name);
  if (errors.length == 0) {
    collection_id = collections.generateCollectionId(collection_name);
    if (collections.hasCollection(collection_id)) {
      errors.push("Collection id is already taken");
    }
  }
  if (errors.length == 0) {
    collections.addCollection(collection_id, collection_name, res.locals.user);
    res.redirect(`/collections/${collection_id}`);
  } else {
    res.status(400);
    res.render("collection_new", {
      errors,
      title: "Nowa kolekcja",
      name: collection_name,
    });
  }
});

app.post("/collections/:collection_id/artists", requireAuth, (req, res) => {
  const collection_id = req.params.collection_id;
  if (!collections.canEdit(collection_id, res.locals.user)) {
    return res.sendStatus(403);
  }
  const artist_name = req.body.artist_name;
  var errors = collections.validateCollectionOrArtistName(artist_name);
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

app.get("/artists/:artist_id", (req, res) => {
  const artist = collections.getArtist(req.params.artist_id);
  if (artist != null) {
    res.render("artist", {
      title: artist.artist_name,
      artist,
    });
  } else {
    res.sendStatus(404);
  }
});

app.post("/artists/delete/:artist_id", requireAuth, (req, res) => {
  const artist_id = req.params.artist_id;
  if (!collections.canEditArtist(artist_id, res.locals.user)) {
    return res.sendStatus(403);
  }
  collections.deleteArtistById(artist_id);
  res.redirect("/collections/");
});

app.post("/artists/:artist_id/add_song", requireAuth, (req, res) => {
  const artist_id = req.params.artist_id;

  if (!collections.hasArtist(artist_id)) {
    return res.sendStatus(404);
  }
  if (!collections.canEditArtist(artist_id, res.locals.user)) {
    return res.sendStatus(403);
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
    artist: { id: artist_id },
  });
});

app.get("/songs/edit/:song_id", requireAuth, (req, res) => {
  const song = collections.getSong(req.params.song_id);
  if (!song) return res.sendStatus(404);
  if (!collections.canEditArtist(song.artist_id, res.locals.user)) {
    return res.sendStatus(403);
  }
  res.render("song_edit", {
    title: "Edycja piosenki",
    song,
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});