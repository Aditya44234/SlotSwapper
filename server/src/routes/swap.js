const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getSwappableSlots, createSwapRequest, getSwapRequests, respondToSwapRequest } = require('../controllers/swapController');

router.use(authMiddleware);

// GET all swappable slots from other users
router.get('/swappable-slots', getSwappableSlots);

// POST a new swap request
router.post('/swap-request', createSwapRequest);

// GET incoming/outgoing swap requests
router.get('/swap-requests', getSwapRequests);

// POST accept/reject response to swap request
router.post('/swap-response/:requestId', respondToSwapRequest);

module.exports = router;
