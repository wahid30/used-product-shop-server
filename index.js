const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000; //localhost:5000

// middleware
app.use(cors());
app.use(express.json());

// for categories
// const categories = require("./data/categories.json");
// for all mobiles
// const mobiles = require("./data/mobiles.json");

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.twtll.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: ServerApiVersion.v1,
// });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fe54zrb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const mobilesCollection = client
      .db("used-mobile-shop")
      .collection("mobiles");
    const categoriesCollection = client
      .db("used-mobile-shop")
      .collection("mobilesCategory");
    const bookingsCollection = client
      .db("used-mobile-shop")
      .collection("bookings");
    const usersCollection = client.db("used-mobile-shop").collection("users");

    // for load all mobiles
    app.get("/mobiles", async (req, res) => {
      const query = {};
      const result = await mobilesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/mobiles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await mobilesCollection.findOne(query);
      res.send(result);
    });

    // for load all categories
    app.get("/mobiles-category", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { category_id: id };
      // console.log(query);
      const selectedMobiles = await mobilesCollection.find(query).toArray();
      res.send(selectedMobiles);
    });

    // for bookings
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      // const decodedEmail = req.decoded.email;

      // if (email !== decodedEmail) {
      //   return res.status(403).send({ message: "forbidden access" });
      // }

      const query = { email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const query = {
        item: booking.item,
        email: booking.email,
      };

      const alreadyBooked = await bookingsCollection.find(query).toArray();

      if (alreadyBooked.length) {
        const message = `You already have a booking on ${booking.item}`;
        return res.send({ acknowledged: false, message });
      }

      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    // for usersCollection
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.get("/mobiles", (req, res) => {
//   res.send(mobiles);
// });

// app.get("/mobiles-category", (req, res) => {
//   res.send(categories);
// });

// app.get("/category/:id", (req, res) => {
//   const id = req.params.id;
//   const selectedMobiles = mobiles.filter((n) => n.category_id === id);
//   res.send(selectedMobiles);
// });

// app.get("/mobiles/:id", (req, res) => {
//   const id = req.params.id;
//   const selectedMobiles = mobiles.find((n) => n._id === id);
//   res.send(selectedMobiles);
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
