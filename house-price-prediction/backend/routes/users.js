const router = require('express').Router();
const User = require('../models/User');

// GET Profile: Added safety checks to prevent 'id' of undefined crash
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Guard against literal string "undefined" from frontend
    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({ msg: "Valid User ID is required" });
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('predictionHistory');
    
    if (!user) {
      return res.status(404).json({ msg: "User not found in database" });
    }

    res.json(user);
  } catch (err) {
    console.error("Backend GET Error:", err.message);
    res.status(500).json({ msg: "Server error during fetch" });
  }
});

// Update Profile
router.put('/update/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId || userId === 'undefined') return res.status(400).json({ msg: "Invalid ID" });

    const { fullName, avatar, bio, phoneNumber } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { fullName, avatar, bio: bio || "", phoneNumber: phoneNumber || "" } },
      { new: true, runValidators: false }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error("Backend Update Error:", err.message);
    res.status(500).json({ msg: "Update failed on server" });
  }
});

module.exports = router;