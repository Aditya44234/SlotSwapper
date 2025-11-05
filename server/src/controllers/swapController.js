// src/controllers/swapController.js
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');

// GET /api/swappable-slots
exports.getSwappableSlots = async (req, res, next) => {
    try {
        const swappableSlots = await Event.find({
            userId: { $ne: req.user._id },
            status: 'SWAPPABLE'
        }).populate('userId', 'name email');
        res.status(200).json(swappableSlots);
    } catch (err) {
        next(err);
    }
};

// POST /api/swap-request
exports.createSwapRequest = async (req, res, next) => {
    try {
        const { mySlotId, theirSlotId } = req.body;
        // Fetch both slots
        const mySlot = await Event.findOne({ _id: mySlotId, userId: req.user._id, status: 'SWAPPABLE' });
        const theirSlot = await Event.findOne({ _id: theirSlotId, status: 'SWAPPABLE' });
        if (!mySlot || !theirSlot) {
            return res.status(400).json({ error: 'One or both slots are not swappable.' });
        }
        // Prevent self-swap
        if (String(theirSlot.userId) === String(req.user._id)) {
            return res.status(400).json({ error: 'Cannot swap with your own slot.' });
        }
        // Create swap request and set slots to SWAP_PENDING
        const swapReq = await SwapRequest.create({
            requesterId: req.user._id,
            recipientId: theirSlot.userId,
            mySlotId: mySlot._id,
            theirSlotId: theirSlot._id,
            status: 'PENDING'
        });
        mySlot.status = 'SWAP_PENDING';
        theirSlot.status = 'SWAP_PENDING';
        await mySlot.save();
        await theirSlot.save();
        res.status(201).json(swapReq);
    } catch (err) {
        next(err);
    }
};

// GET /api/swap-requests
exports.getSwapRequests = async (req, res, next) => {
    try {
        // Incoming requests (to this user)
        const incoming = await SwapRequest.find({ recipientId: req.user._id }).populate('mySlotId theirSlotId requesterId recipientId');
        // Outgoing requests (from this user)
        const outgoing = await SwapRequest.find({ requesterId: req.user._id }).populate('mySlotId theirSlotId requesterId recipientId');
        res.status(200).json({ incoming, outgoing });
    } catch (err) {
        next(err);
    }
};

// POST /api/swap-response/:requestId
exports.respondToSwapRequest = async (req, res, next) => {
    try {
        const { accept } = req.body; // boolean
        const { requestId } = req.params;
        const swapReq = await SwapRequest.findById(requestId)
            .populate('mySlotId theirSlotId');

        if (!swapReq || String(swapReq.recipientId) !== String(req.user._id) || swapReq.status !== 'PENDING') {
            return res.status(400).json({ error: 'Invalid swap request.' });
        }

        const offeredSlot = await Event.findById(swapReq.mySlotId);
        const requestedSlot = await Event.findById(swapReq.theirSlotId);

        if (accept) {
            // Swap happens: exchange owners, status to BUSY
            const tempUserId = offeredSlot.userId;
            offeredSlot.userId = requestedSlot.userId;
            requestedSlot.userId = tempUserId;
            offeredSlot.status = 'BUSY';
            requestedSlot.status = 'BUSY';
            swapReq.status = 'ACCEPTED';

            await offeredSlot.save();
            await requestedSlot.save();
        } else {
            // Revert to SWAPPABLE
            offeredSlot.status = 'SWAPPABLE';
            requestedSlot.status = 'SWAPPABLE';
            swapReq.status = 'REJECTED';

            await offeredSlot.save();
            await requestedSlot.save();
        }

        await swapReq.save();
        res.status(200).json({ message: accept ? 'Swap accepted!' : 'Swap rejected.', swapReq });
    } catch (err) {
        next(err);
    }
};
