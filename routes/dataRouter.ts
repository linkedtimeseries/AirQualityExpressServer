//Maps the route '/:zoom/:tile_x/:tile_y' to the appropriate function in the dataController
import express = require('express');

const router = express.Router();

var dataController = require('../controllers/dataController')

router.get('/:zoom/:tile_x/:tile_y', dataController.data_get_z_x_y_page);

export default router;