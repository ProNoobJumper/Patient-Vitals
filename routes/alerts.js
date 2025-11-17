const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const controller = require('../controllers/alertController');

router.get('/', protect, authorizeRoles('doctor'), controller.listAlertsForDoctor);
router.post('/:id/ack', protect, authorizeRoles('doctor'), controller.acknowledgeAlert);

module.exports = router;
