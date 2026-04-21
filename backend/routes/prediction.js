const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');

// --- 1. SAVE NEW PREDICTION ---
router.post('/calculate', async (req, res) => {
  try {
    const { userId, predictedValue, accuracyScore, address, ...rest } = req.body;
    const newPrediction = new Prediction({
      user: userId,
      inputs: {
        address: address,
        location: {
          type: 'Point',
          coordinates: [rest.Lng || 0, rest.Lat || 0]
        },
        Year: rest.Year,
        RmNum: rest.RmNum,
        BthNum: rest.BthNum,
        HllNum: rest.HllNum,
        KchNum: rest.KchNum,
        Floor: rest.Floor,
        SubwayDst: rest.SubwayDst
      },
      result: {
        predictedValue: predictedValue,
        accuracyScore: accuracyScore
      },
      isSaved: false 
    });
    const savedPrediction = await newPrediction.save();
    res.status(201).json(savedPrediction);
  } catch (err) {
    res.status(500).json({ msg: 'Database save failed', error: err.message });
  }
});

// --- 2. CLEANUP ROUTE (Logout Logic) ---
router.delete('/cleanup/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await Prediction.deleteMany({ user: userId, isSaved: false });
    res.json({ msg: "Session history cleared" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error during cleanup" });
  }
});

// --- 3. GET HISTORY ---
// --- 3. GET HISTORY ---
router.get('/history/:userId', async (req, res) => {
  try {
    const predictions = await Prediction
      .find({ user: req.params.userId })
      .sort({ 'result.valuationDate': -1 });

    const formatted = predictions.map(p => ({
      _id: p._id,
      user: p.user,
      isSaved: p.isSaved,

      // Flattened values for frontend
      address: p.inputs?.address,
      predictedValue: p.result?.predictedValue,
      accuracyScore: p.result?.accuracyScore,

      // Full inputs for report
      inputs: p.inputs,

      // Full result if needed
      result: p.result
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).send('Server Error fetching history');
  }
});




// --- 4. TOGGLE SAVE STATUS ---
router.patch('/save/:id', async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) return res.status(404).json({ msg: 'Prediction not found' });
    prediction.isSaved = !prediction.isSaved;
    await prediction.save();
    res.json(prediction);
  } catch (err) {
    res.status(500).send('Server Error toggling save');
  }
});

// --- 5. DELETE SINGLE PREDICTION (Fixes "Action Failed" Error) ---
// Matches https://houseprice-prediction-1-0dif.onrender.com/api/predictions/:id
// routes/prediction.js

// --- DELETE SINGLE PREDICTION ---
// This handles: DELETE https://houseprice-prediction-1-0dif.onrender.com/api/predictions/ID_HERE
router.delete('/:id', async (req, res) => {
  try {
    // We use the ID passed in the URL (req.params.id)
    const result = await Prediction.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ msg: 'Valuation not found' });
    }

    res.json({ msg: 'Valuation permanently removed' });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ msg: 'Server Error during deletion' });
  }
});

module.exports = router;

module.exports = router;

module.exports = router;