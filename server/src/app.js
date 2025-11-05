
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();


app.use(errorMiddleware);
app.use(morgan("dev"));
app.use(cors({
  origin: 'https://slot-swapper-cyan.vercel.app/', // ← replace with actual frontend URL
  credentials: true
}));

app.use(express.json());



const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events')
const swapRoutes = require('./routes/swap')



app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', swapRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'SlotSwapper API running' });
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message })
});

module.exports = app;

