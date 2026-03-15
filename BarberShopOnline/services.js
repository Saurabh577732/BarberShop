// server/routes/services.js
const router  = require("express").Router();
const Service = require("../models/Service");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ owner: req.user._id }).sort({ name: 1 });
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const service = await Service.create({ owner: req.user._id, ...req.body });
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body, { new: true }
    );
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Service.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
