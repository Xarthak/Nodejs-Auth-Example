const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

const { firebase_db } = require("./firebase/firebase-service.js");
const { FieldValue } = require("firebase-admin/firestore");
const app = express();
app.use(express.json());
const port = 4000;

const allowedOrigins = ["http://127.0.0.1:5173"];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

//Reading a Data from req.body
var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

app.get("/test", (req, res) => {
  console.log("Success");
  res.json({ message: "Success" });
});

app.use("/api/v1/", require("./routes/api/v1/index.js"));

app.listen(port, () => console.log(`Server started running on port ${port}`));

module.exports = app;
