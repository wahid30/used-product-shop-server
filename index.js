const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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
    const productsCollection = client
      .db("used-mobile-shop")
      .collection("products");

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

    //
    app.get("/mobileSelection", async (req, res) => {
      const query = {};
      const result = await mobilesCollection
        .find(query)
        .project({ name: 1 })
        .toArray();
      res.send(result);
    });

    // for bookings
    app.get("/bookings", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }

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

    /////
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    // for usersCollection
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // for make admin
    app.put("/users/admin/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // for product collection
    app.get("/products", async (req, res) => {
      const query = {};
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(filter);
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
