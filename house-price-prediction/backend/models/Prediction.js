const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputs: {
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [Longitude, Latitude]
    },
    RmNum: { type: Number },
    BthNum: { type: Number },
    HllNum: { type: Number },
    KchNum: { type: Number },
    Year: { type: Number },
    Floor: { type: Number },
    SubwayDst: { type: Number }
  },
  result: {
    predictedValue: { type: Number, required: true },
    accuracyScore: { type: String },
    valuationDate: { type: Date, default: Date.now }
  },
  isSaved: { type: Boolean, default: false }
});

PredictionSchema.index({ "inputs.location": "2dsphere" });

module.exports = mongoose.model('Prediction', PredictionSchema);