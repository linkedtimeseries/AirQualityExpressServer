import express = require('express');
const router = express.Router();

var dataController=require('../controllers/dataController')

router.get('/:id', dataController.dataGet);
//router.get('/:id', dataController.dataConvert);
router.get('/:zoom/:tile_x/:tile_y', dataController.data_get_z_x_y_page);

export default router;