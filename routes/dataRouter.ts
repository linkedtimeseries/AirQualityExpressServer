import express = require('express');
import { ObeliskClientAuthentication } from '../utils/Authentication';
const router = express.Router();

var dataController = require('../controllers/dataController')

router.get('/:zoom/:tile_x/:tile_y', dataController.data_get_z_x_y_page);

export default router;