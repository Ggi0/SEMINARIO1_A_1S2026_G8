const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlist.controller");

router.post("/agregar", playlistController.add);
router.get("/:id_usuario", playlistController.getUser);
router.post("/eliminar", playlistController.remove);

module.exports = router;