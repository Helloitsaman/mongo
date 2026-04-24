const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

//CREATE
app.post("/users", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//TEST INDEX API
app.get("/test-index", async (req, res) => {
  const result = await User.find({ name: "Priti" })
    .explain("executionStats");
  res.json(result.executionStats);
});

//READ ALL
app.get("/users", async (req, res) => {
    try {
        const { name, email, age, hobby, page = 1, limit = 5 } = req.query;

        let filter = {};

        if (name) {
            filter.name = { $regex: name, $options: "i" };
        }

        if (email) {
            filter.email = email;
        }

        if (age) {
            filter.age = age;
        }

        if (hobby) {
            filter.hobbies = hobby;
        }

        const users = await User.find(filter)
            .sort({ age: 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// TEXT SEARCH
app.get("/search", async (req, res) => {
    try {
        const users = await User.find({
            $text: { $search: req.query.bio }
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE 
app.put("/users/:id", async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});