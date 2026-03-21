import express from "express";
import morgan from "morgan";
import collections from "./models/collection.js";

const port = 8000;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());

app.use(morgan("dev"));

function log_request(req, res, next) {
  console.log(`Request ${req.method} ${req.path}`);
  next();
};

app.use(log_request);

app.get("/collections/metal", (req, res) => {
  res.render("collections", {
    title: "metal",
    collections: collections.getCollectionSummaries(),
  });
});

app.get("/collections/punk", (req, res) => {
  res.render("collections", {
    title: "punk",
    collections: collections.getCollectionSummaries(),
  });
});

app.get("/collections/:collection_id", (req, res) => {
  var collection_id = req.params.collection_id;
  var collection = collections.getCollection(collection_id);
  if (collection != null) {
   
    res.render("collection", {
      title: collection.name,
      artist: collection.artist,
      collection,
      
    });
  } else {
    res.sendStatus(404);
  }
});

app.post("/collections/:collection_id/new", (req, res) => {
  const collection_id = req.params.collection_id;
  if (!collections.hasCollection(collection_id)) {
    res.sendStatus(404);
  } else {
    let song_data = {
      song_name: req.body.song_name,
      album: req.body.album,
    };
    var errors = collections.validateSongData(song_data);
    if (errors.length ==0 ) {
      collections.addSong(collection_id, song_data);
      res.redirect(`/collections/${collection_id}`);
    } else {
      res.status(400);
      res.render("new_song", {
        errors,
        title: "nowa piosenka",
        front: req.body.song_name,
        back: req.body.album,
        collection: {
          id: collection_id,
        },
      });
    }
  }
});

// app.post("/cards/add_card/:category_id", (req, res) => {
//   const category_id = req.params.category_id;
//   if (!flashcards.hasCategory(category_id)) {
//     res.sendStatus(404);
//   } else {
//     let card_data = {
//       front: req.body.front,
//       back: req.body.back,
//     };
//     var errors = flashcards.validateCardData(card_data);
//     if (errors.length == 0) {
//       flashcards.addCard(category_id, card_data);
//       res.redirect(`/cards/view/${category_id}`);
//     } else {
//       res.status(400);
//       res.render("new_card", {
//         errors,
//         title: "Nowa fiszka",
//         front: req.body.front,
//         back: req.body.back,
//         category: {
//           id: category_id,
//         },
//       });
//     }
//   }
// });
app.get("/collections/new_artist", (req, res) => {
  res.render("new_artist", {
    title: "Nowy artysta",
  });
});

app.post("/cards/new_artist", (req, res) => {
  const artist_name = req.body.name;
  var artist_id = null;
  var errors = collections.validateArtistName(artist_name);
  if (errors.length == 0) {
    artist_id = collections.generateArtistId(artist_name);
    if (collections.hasCollection(artist_id)) {
      errors.push("Artist id already taken");
    }
  }

  if (errors.length == 0) {
    flashcards.addArtist(artist_id, artist_name);
    res.redirect(`/songs/view/${artist_id}`);
  } else {
    res.status(400);
    res.render("artist_new", {
      errors,
      title: "Nowy artysta",
      name: artist_name,
    });
  }
});
app.post("/songs/edit/:artist_id", (req, res) => {
  const artist_id = req.params.artist_id;
  if (collections.hasCollection(artist_id)) {
    const artist_name = req.body.name;
    var new_artist_id = null;
    const errors = collections.validateArtistName(artist_name);
    if (errors.length == 0) {
      new_artist_id = collections.generateArtistId(artist_name);
      if (
        new_artist_id !== artist_id &&
        collections.hasCollection(new_artist_id)
      ) {
        errors.push("artist id is already taken");
      }
    }
    if (errors.length == 0) {
      const artist = collections.updateArtist(
        artist_id,
        new_artist_id,
        artist_name
      );
      if (artist != null) {
        // category id may have changed due to name change
        res.redirect("/songs/view/" + artist.id);
      } else {
        // This should never happen
        res.write("Unexpected error while updating category");
        res.sendStatus(500);
      }
    } else {
      const category = collections.getCollection(artist_id);
      res.render("artist_edit", {
        errors,
        title: "Edycja artysty",
        category,
      });
    }
  } else {
    res.sendStatus(404);
  }
});

app.post("/songs/edit/:artist_id/:song_id", (req, res) => {
  const artist_id = req.params.artist_id;
  const song_id = req.params.song_id;
  // HASCOLLECTION??? HAS ARTIST????????????
  if (!collections.hasCollection(artist_id) || !collections.hasSong(song_id)) {
    res.sendStatus(404);
  } else {
    const card = {
      front: req.body.front,
      back: req.body.back,
      id: card_id,
    };
    const errors = flashcards.validateCardData(card);
    if (errors.length == 0) {
      flashcards.updateCard(card);
      res.redirect(`/cards/edit/${category_id}`);
    } else {
      let category = flashcards.getCategory(category_id);
      res.render("category_edit", {
        errors,
        title: "Edycja kategorii",
        category,
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
