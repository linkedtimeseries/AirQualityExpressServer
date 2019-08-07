// Maps the route '/:zoom/:tile_x/:tile_y' to the appropriate function in the dataController
import express = require("express");
import { data_get_z_x_y_page } from "../controllers/dataController";

const router = express.Router();

router.get("/:zoom/:tile_x/:tile_y", data_get_z_x_y_page);

export default router;
