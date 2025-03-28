const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Backlog Project" });
});

const userRoutes = require('./routes/user.routes');

app.use('/api/users', userRoutes);

module.exports = app;