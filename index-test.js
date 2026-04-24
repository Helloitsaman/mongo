const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user");

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected");

        const result = await User.find({
            name: "Priti"
        }).explain("executionStats");

        console.log(result.executionStats);

        process.exit();
    })
    .catch(console.log);