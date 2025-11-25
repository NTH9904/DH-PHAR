const express = require('express');
const router = express.Router();
const { getStatus, getUsers } = require('../controllers/debugController');

// NOTE: This route should only be mounted in non-production environments
router.get('/status', getStatus);
router.get('/users', getUsers);
router.get('/last-raw-user', getLastRawUser);

module.exports = router;
