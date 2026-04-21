const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://houseprice-prediction-one.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES MOUNTING ---
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/users', require('./routes/users'));


// server.js
const predictionRoutes = require('./routes/prediction');

// This prefix MUST be plural to match your frontend call
app.use('/api/predictions', predictionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});