const Event = require('../models/Event')

//  GET /api/events
exports.getEvents = async (req, res, next) => {
    try {
        const event = await Event.find({
            userId: req.user._id
        });
        res.status(200).json({
            message: 'Fetched all the Events',
            event: event
        });

    } catch (err) {
        next(err);
    };
};


//  Create a new Event 
exports.createEvent = async (req, res, next) => {
    try {
        const { title, startTime, endTime, status } = req.body;

        const event = new Event({
            userId: req.user._id,
            title,
            startTime,
            endTime,
            status: status || 'BUSY'
        });
        await event.save();

        res.status(201).json({
            message: 'Event Created successfully',
            event: event
        });

    } catch (err) {
        next(err);
    }
}

//  Update the existing event
exports.updateEvent = async (req, res, next) => {
    try {
        const { title, startTime, endTime, status } = req.body;
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title, startTime, endTime, status },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ error: 'Event not found or not yours' });
        }
        res.status(200).json({
            message: 'Event updated successfully',
            event: event
        });
    } catch (err) {
        next(err)
    };
};

//  Delete a specific  event
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findOneAndDelete(
            {
                _id: req.params.id,
                userId: req.user._id
            }
        );
        if (!event) {
            return res.status(404).json({ error: 'Event not found or not yours' })
        }
        res.status(200).json({ message: 'Event deleted' });
    } catch (err) {
        next(err)
    };
};