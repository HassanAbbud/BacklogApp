const express = require('express');
const app = express();

app.use(express.json()); // ensure request body is parsed

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Backlog Project" });
});

const userRoutes = require('./routes/user.routes');
const gameRoutes = require('./routes/game.routes');
const authRoutes = require('./routes/auth'); // ✅ added

app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api', authRoutes); // ✅ added

module.exports = app;
