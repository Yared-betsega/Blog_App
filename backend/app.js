const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Connect to mongodb database
mongoose.connect(process.env["DATABASE"])
    .then(() => console.log("Connected to mongodb..."))
    .catch((error) => console.log("Cannot connect to mongodb...", error));

// Imports routes 
const userRoute = require("./routes/users")

// Define the root app route
const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/api/v1/users", userRoute);
const port = process.env["port"] || 3000;
app.listen(port, () => console.log("Server started listening on port " + port));