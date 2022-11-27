const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000; //localhost:5000

app.use(cors());

// for categories
const categories = require("./data/categories.json");
// for all mobiles
const mobiles = require("./data/mobiles.json");

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/mobiles", (req, res) => {
  res.send(mobiles);
});

app.get("/mobiles-category", (req, res) => {
  res.send(categories);
});

app.get("/category/:id", (req, res) => {
  const id = req.params.id;
  const selectedMobiles = mobiles.filter((n) => n.category_id === id);
  res.send(selectedMobiles);
});

app.get("/mobiles/:id", (req, res) => {
  const id = req.params.id;
  const selectedMobiles = mobiles.find((n) => n._id === id);
  res.send(selectedMobiles);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
