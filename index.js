var express = require("express");
var app = express();

app.get("/", function (req, res) {
  res.send("hello user....");
});

app.listen(4000, () => console.log("Yes, I am listening to port 4000"));
