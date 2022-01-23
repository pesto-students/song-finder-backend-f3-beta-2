const mongoose = require("mongoose");
const app = require("./setup");
require("dotenv/config");

const PORT = process.env.PORT || 5000;

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

// Serve the App
app.listen(PORT, () => console.log("Server Started"));
