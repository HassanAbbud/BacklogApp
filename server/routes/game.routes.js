const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const authMiddleware = require('../security/verifyJWT');

router.use(authMiddleware);
// Open routes
router.post('/addGame', gameController.addGame);
router.get('/getGames', gameController.getGames);
router.get('/getGameById', gameController.getGameById);
router.put('/updateGame', gameController.updateGame);
router.delete('/deleteGame', gameController.deleteGame);

module.exports = router;