require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const communityRoutes = require('./routes/community');
const businessRoutes = require('./routes/business');
const sosRoutes = require('./routes/sos');
const eventRoutes = require('./routes/event');
const messageRoutes = require('./routes/message');

const app = express();

/* ✅ FINAL CORS CONFIG */
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://nimble-sprinkles-1f4b55.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.options('*', cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('ConnectUs Backend is running 🚀');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/message', messageRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error('MongoDB connection error:', err));
