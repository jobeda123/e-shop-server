const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;

require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = 4000;
const password = "1234eShop";

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
    productCollection.insertMany(product).then((result) => {
      res.send(result.insertedCount);
    });
  });


  // for add new admin
  app.post("/addAdmin", (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin).then((result) => {
      res.send(result.insertedCount);
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
      .limit(20)
      .toArray((err, documents) => {
        res.send(documents);
        // console.log(documents);
      });
  });

  // for get all product by category
  app.get("/products/:category", (req, res) => {
    productCollection
      .find({category:req.params.category})
      .limit(20)
      .toArray((err, documents) => {
        res.send(documents);
        // console.log(documents);
      });
  });


  // for get order by id
  app.get("/order", (req, res) => {
    const orderId = ObjectId(req.query.id);
    console.log("get order by id, server",orderId);
    orderCollection
      .find({_id:orderId})
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
 });



 // get all order for specific user
 app.get('/allOrder', (req, res) => {
   console.log("user email",req.query.email);
  orderCollection.find({ email: req.query.email })
      .toArray((err, items) => {
          res.send(items);
          console.log("all order: ",items);
      })
})


  //client.close();
});

app.listen(port, () => console.log(`Yes, I am listening to port ${port}`));
