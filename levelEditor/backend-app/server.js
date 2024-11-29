const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());

let levels = {};

// Get level data by ID
app.get("/level/:id", (req, res) => {
    const levelId = req.params.id;
    const filePath = path.join(__dirname, "levels", `${levelId}.json`);

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading level data:", err);
            return res.status(404).send("Level not found");
        }

        try {
            const levelData = JSON.parse(data); // Ensure valid JSON is sent back
            res.json(levelData);
        } catch (err) {
            console.error("Error parsing level data:", err);
            res.status(500).send("Error parsing level data");
        }
    });
});

// Save level data by ID
app.post("/level/:id", (req, res) => {
    const levelId = req.params.id;
    const filePath = path.join(__dirname, "levels", `${levelId}.json`);
    const levelData = req.body;

    if (!Array.isArray(levelData) || levelData.length === 0) {
        return res.status(400).send("Level data must be a non-empty array");
    }

    fs.writeFile(filePath, JSON.stringify(levelData, null, 2), (err) => {
        if (err) {
            console.error("Error saving level data:", err);
            return res.status(500).send("Server error");
        }

        res.status(201).send("Level saved successfully");
    });
});

// Get the list of all available levels
app.get("/levels", (req, res) => {
    fs.readdir("levels", (err, files) => {
        if (err) {
            console.error("Error reading levels directory:", err);
            return res.status(500).send("Server error");
        }

        const levelIds = files
            .filter(file => file.endsWith(".json"))
            .map(file => path.basename(file, ".json"));

        res.json(levelIds);
    });
});

// Ensure the "levels" directory exists
if (!fs.existsSync("levels")) {
    fs.mkdirSync("levels");
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
