// Rutas del chatbot — expone POST /api/chat-bot
// No requiere autenticación (bot público)

const express = require('express');
const router = express.Router();
const { chatBot } = require('../../controller/chatbot/chatBotController');

// POST /api/chat-bot
router.post('/', chatBot);

module.exports = router;