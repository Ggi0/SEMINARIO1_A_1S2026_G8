const express = require('express');
const router = express.Router();
const { verificarAuth } = require('../../middlewares/authMiddleware');
const {
  listarChats,
  listarMensajes,
  crearMensajeHttp,
} = require('../../controller/chat/chatController');

router.use(verificarAuth);

router.get('/', listarChats);
router.get('/:chatId/mensajes', listarMensajes);
router.post('/:chatId/mensajes', crearMensajeHttp);

module.exports = router;
