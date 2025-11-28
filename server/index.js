const express = require("express");
const { PORT } = require("./configs/env.config.js");
const connectDB = require("./configs/mongodb.config.js");

const app = express();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  connectDB();
});
