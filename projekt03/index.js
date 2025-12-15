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

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
