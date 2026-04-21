const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // FIXED: Changed from fullName to username to match Auth.jsx and routes/auth.js
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  
  // --- Profile Customization ---
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  phoneNumber: { type: String },
  address: { type: String },
  role: { 
    type: String, 
    enum: ["User", "Verified Real Estate Analyst", "Admin"], 
    default: "User" 
  },

  // --- Security & Activity Tracking ---
  dateJoined: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isVerified: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date,

  // --- Prediction History Reference ---
  predictionHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' }]
});

module.exports = mongoose.model('User', UserSchema);