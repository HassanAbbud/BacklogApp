const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Backlog Project" });
});

const userRoutes = require('./routes/user.routes');
const gameRoutes = require('./routes/game.routes');

app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

module.exports = app;