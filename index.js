const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");

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
      console.log(result);
    });
  });


  // for get all product
  app.get("/products", (req, res) => {
      productCollection.find({}).limit(20)
      .toArray((err, documents)=>{
          res.send(documents)
          console.log(documents);
      })
  });

  //client.close();
});

app.listen(port, () => console.log(`Yes, I am listening to port ${port}`));
