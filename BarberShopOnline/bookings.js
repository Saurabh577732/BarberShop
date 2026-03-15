// server/routes/bookings.js
const router  = require("express").Router();
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const { protect } = require("../middleware/auth");

// GET /api/bookings/slots — public route to check available slots
router.get("/slots", async (req, res) => {
  try {
    const { date, ownerId } = req.query;
    if (!date || !ownerId) return res.status(400).json({ message: "date and ownerId required" });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const booked = await Booking.find({
      owner: ownerId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ["pending", "confirmed"] },
    }).select("timeSlot");

    const bookedSlots = booked.map((b) => b.timeSlot);

    // Generate slots 9AM–8PM every 30 min
    const allSlots = [];
    for (let h = 9; h < 20; h++) {
      allSlots.push(`${h.toString().padStart(2, "0")}:00`);
      allSlots.push(`${h.toString().padStart(2, "0")}:30`);
    }
    allSlots.push("20:00");

    const available = allSlots.filter((s) => !bookedSlots.includes(s));
    res.json({ success: true, allSlots, bookedSlots, available });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/services-public — public listing for booking form
router.get("/services-public", async (req, res) => {
  try {
    const { ownerId } = req.query;
    if (!ownerId) return res.status(400).json({ message: "ownerId required" });
    const services = await Service.find({ owner: ownerId, isActive: true });
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings/public — public booking submission
router.post("/public", async (req, res) => {
  try {
    const { ownerId, customerName, customerPhone, customerEmail, serviceId, serviceName, servicePrice, barber, date, timeSlot, notes } = req.body;
    const booking = await Booking.create({
      owner: ownerId, customerName, customerPhone, customerEmail,
      service: serviceId, serviceName, servicePrice: servicePrice || 0,
      barber: barber || "Any Available", date, timeSlot,
      status: "pending", notes,
    });
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Protected routes below ---
router.use(protect);

// GET /api/bookings
router.get("/", async (req, res) => {
  try {
    const { status, date, page = 1, limit = 50 } = req.query;
    const query = { owner: req.user._id };
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const e = new Date(date);
      e.setHours(23, 59, 59, 999);
      query.date = { $gte: d, $lte: e };
    }
    const bookings = await Booking.find(query)
      .sort({ date: -1, timeSlot: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Booking.countDocuments(query);
    res.json({ success: true, bookings, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, owner: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings — owner creates booking
router.post("/", async (req, res) => {
  try {
    const booking = await Booking.create({ owner: req.user._id, ...req.body });
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/bookings/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id
router.put("/:id", async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/bookings/:id
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
