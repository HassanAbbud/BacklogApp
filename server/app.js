const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Backlog Project" });
});

module.exports = app;