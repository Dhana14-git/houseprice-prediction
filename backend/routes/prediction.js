router.post('/calculate', async (req, res) => {
  try {
    console.log("🔥 Incoming request:", req.body);

    // ✅ FIX ADDRESS
    const { userId, ...rest } = req.body;

    const address = req.body.address && req.body.address.trim() !== ""
      ? req.body.address
      : "Unknown Location";

    // ✅ CALL ML API (FIXED URL)
    const mlResponse = await axios.post(
      "https://houseprice-prediction-ej1n.onrender.com/predict",
      req.body,
      { timeout: 60000 }
    );

    console.log("✅ ML Response:", mlResponse.data);

    const { predictedValue, accuracyScore } = mlResponse.data;

    // ✅ SAVE TO DB
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
        predictedValue,
        accuracyScore: parseFloat(accuracyScore)
      },
      isSaved: false
    });

    const savedPrediction = await newPrediction.save();

    res.status(201).json(savedPrediction);

  } catch (err) {
    console.error("❌ ERROR IN CALCULATE:", err);
    res.status(500).json({ error: err.message });
  }
});