const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const admin = require("firebase-admin");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = 4000;
const password = "1234eShop";

var serviceAccount = require("./e-shop-40f88-firebase-adminsdk-mk0rx-02fda62739.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2g0i6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const productCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("allProduct");

  const adminCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("allAdmin");

  const orderCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("allOrder");

  // for add new product
  app.post("/addProduct", (req, res) => {
    const product = req.body;
    productCollection.insertOne(product).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // for add new admin
  app.post("/addAdmin", (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin).then((result) => {
      res.send(result.insertedCount);
      console.log(result);
    });
  });

  // for add new order
  app.post("/addOrder", (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order).then((result) => {
      res.send(result.insertedId);
    });
  });

  
  // for get all product
  app.get("/products", (req, res) => {
    productCollection
      .find({})
      .toArray((err, documents) => {
        res.send(documents);
        // console.log(documents);
      });
  });


  // for get all product by category
  app.get("/products/:category", (req, res) => {
    productCollection
      .find({ category: req.params.category })
      .limit(20)
      .toArray((err, documents) => {
        res.send(documents);
        // console.log(documents);
      });
  });



  // for get all product by search
  app.get("/productBySearch/:search", (req, res) => {
    const search=req.params.search;
    console.log(search);
    productCollection
      .find({ title: {$regex: search} })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });



  // for get order by id 
  app.get("/order", (req, res) => {
    const orderId = ObjectId(req.query.id);
    console.log("get order by id, server", orderId);
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      console.log({ idToken });
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          orderCollection.find({ _id: orderId }).toArray((err, documents) => {
            res.send(documents[0]);
          });
        })
        .catch((error) => {
          res.status(401).send("un-authorized access");
        });
    } else {
      res.status(401).send("un-authorized access");
    }
  });


  // get all order for specific user
  app.get("/allOrder", (req, res) => {
    console.log("user email", req.query.email);
    console.log(req.headers.authorization);
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      console.log({ idToken });
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          orderCollection
            .find({ email: req.query.email })
            .toArray((err, items) => {
              res.send(items);
              console.log("all order: ", items);
            });
        })
        .catch((error) => {
          res.status(401).send("un-authorized access");
        });
    } else {
      res.status(401).send("un-authorized access");
    }
  });


  // get all order for admin
  app.get("/allOrderAdmin", (req, res) => {
    console.log(req.headers.authorization);
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      console.log({ idToken });
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          orderCollection.find({}).toArray((err, items) => {
            res.send(items);
            console.log("all order for admin: ", items);
          });
        })
        .catch((error) => {
          res.status(401).send("un-authorized access");
        });
    }
    else {
      res.status(401).send("un-authorized access");
    }
  });

  
  // update user's order status by admin
  app.patch("/updateOrderStatus/:id", (req, res) => {
    orderCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: { deliveredStatus: req.body.status },
        }
      )
      .then((result) => res.send(result));
  });



  // get all admin
  app.get("/allAdmin", (req, res) => {
    adminCollection.find({}).toArray((err, items) => {
      res.send(items);
      console.log("all admin: ", items);
    });
  });
  //client.close();
});

app.get("/",(res,req) => {res.send("It is working properly....")});


app.listen(process.env.PORT||port, () => console.log(`Yes, I am listening to port ${port}`));
