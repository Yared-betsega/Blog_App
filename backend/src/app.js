const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Simple Blog App",
            description: "A simple blog app which I release some information",
            version: "1.0.0",
            contact: {
                name: "Yared Tsegaye",
                email: "yaredtsegaye120@gmail.com",
                url: "",
            },
            servers: ["http://localhost:5000"]
        },
    },
    apis: ['./src/routes/*.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Connect to mongodb database
mongoose
    .connect(process.env["DATABASE"])
    .then(() => console.log("Connected to mongodb..."))
    .catch((error) => console.log("Cannot connect to mongodb...", error));

// Imports routes
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const blogRoute = require("./routes/blogs");

// Define the root app route
const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add the routes/endpoints to the app
app.use("/api/v1/users", userRoute);
app.use("/login", authRoute);
app.use("/api/v1/blogs", blogRoute);

// Set up and start listening
const port = process.env["port"] || 3000;
app.listen(port, () => console.log("Server started listening on port " + port));
