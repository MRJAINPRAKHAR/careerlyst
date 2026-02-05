const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/calendar.controller');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getEvents);
router.post('/', verifyToken, createEvent);
router.delete('/:id', verifyToken, deleteEvent);

module.exports = router;
