const express = require("express");
const app = express();

// POST route
app.post("/post", (req, res) => {
  res.send("POST request received");
});

// GET route
app.get("/email", (req, res) => {
  res.send("aditya.gmail.com");
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
