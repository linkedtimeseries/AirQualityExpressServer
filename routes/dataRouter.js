"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
var dataController = require('../controllers/dataController');
router.get('/:zoom/:tile_x/:tile_y', dataController.data_get_z_x_y_page);
exports.default = router;
//# sourceMappingURL=dataRouter.js.map