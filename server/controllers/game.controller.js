const Game = require('../models/game.model');

exports.addGame = async (req, res) => {
  try {
    const { title, status, platform, estimatedPlayTime, actualPlayTime, priority, notes } = req.body;

    const newGame = new Game({
      title,
      status,
      platform,
      estimatedPlayTime,
      actualPlayTime,
      priority,
      notes,
      user: req.user.id 
    });

    await newGame.save();

    res.status(201).json({ message: 'Game added successfully', game: newGame });
  } catch (error) {
    res.status(500).json({ message: 'Error adding game', error: error.message });
  }
};

exports.getGames = async (req, res) => {
  try {
    const games = await Game.find({ user: req.user.id }).sort({ priority: -1, createdAt: -1 });

    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games', error: error.message });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game', error: error.message });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, platform, estimatedPlayTime, actualPlayTime, priority, notes } = req.body;

    const updatedGame = await Game.findOneAndUpdate(
      { _id: id, user: req.user.id }, 
      { title, status, platform, estimatedPlayTime, actualPlayTime, priority, notes },
      { new: true, runValidators: true }
    );

    if (!updatedGame) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({ message: 'Game updated', game: updatedGame });
  } catch (error) {
    res.status(500).json({ message: 'Error updating game', error: error.message });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedGame = await Game.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deletedGame) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({ message: 'Game deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting game', error: error.message });
  }
};
