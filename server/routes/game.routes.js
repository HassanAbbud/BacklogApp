const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');

// Open routes
router.post('/addGame', gameController.addgame);
router.get('/getGames', gameController.getgames);
router.get('/getGameByID', gameController.getGameByID);
router.put('/updateGame', gameController.updateGame);
router.delete('/deleteGame', gameController.deleteGame);

module.exports = router;