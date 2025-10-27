import express from "express";

const port = 8000;

const app = express(); 

app.get("/", (req, res) => { 
  res.set("Content-Type", "text/plain"); 
  res.send("Hello world"); 
});

app.listen(port, () => { // Startujemy serwer na porcie 8000
  console.log(`Server listening on http://localhost:${port}`);
});