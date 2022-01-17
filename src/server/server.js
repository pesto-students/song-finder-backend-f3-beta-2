// Imports
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { AuthRouter } = require("../routers/authRouter");
const { ResourceRouter } = require("../routers/resourceRouter");
require("dotenv/config");

// Configure Server
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cookieParser());
app.use(cors({ credentials: true }));
app.use(express.json());

// Connect to Database
mongoose.connect(
    process.env.MONGO_URI,
    {
        // newUrlParser: true,
        useUnifiedTopology: true
    },
    (err) => {
        if (err) console.error(err);
        else console.log("MongoDB Connected");
    }
);

// Home page
app.get("/", (req, res) => {
    res.json({ msg: "server is configured properly" });
});

// Routers
app.use("/auth", AuthRouter);
app.use("/resource", ResourceRouter);

// Serve the App
app.listen(PORT, () => console.log("Server Started"));
