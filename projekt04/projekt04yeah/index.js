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



app.get("/collections/:collection_id", (req, res) => {
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




app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
