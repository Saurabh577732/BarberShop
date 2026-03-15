// server/routes/reminders.js
const router   = require("express").Router();
const Customer = require("../models/Customer");
const { protect } = require("../middleware/auth");

router.use(protect);

// GET /api/reminders — customers due for a visit
router.get("/", async (req, res) => {
  try {
    const { days = 30 } = req.query; // overdue by N days
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - parseInt(days));

    const customers = await Customer.find({
      owner: req.user._id,
      $or: [
        { lastVisit: { $lte: threshold } },
        { lastVisit: null },
      ],
    }).sort({ lastVisit: 1 });

    const enriched = customers.map((c) => {
      const daysSince = c.lastVisit
        ? Math.floor((Date.now() - new Date(c.lastVisit)) / (1000 * 60 * 60 * 24))
        : null;
      return {
        _id: c._id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        lastVisit: c.lastVisit,
        daysSince,
        totalVisits: c.visits?.length || 0,
        totalSpent: c.totalSpent,
        urgency: daysSince === null ? "new" : daysSince > 60 ? "high" : daysSince > 30 ? "medium" : "low",
      };
    });

    res.json({ success: true, reminders: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reminders/simulate — simulate sending a reminder
router.post("/simulate", async (req, res) => {
  try {
    const { customerId, type = "whatsapp", message } = req.body;
    const customer = await Customer.findOne({ _id: customerId, owner: req.user._id });
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    // In production, integrate Twilio/WhatsApp API here
    const simulatedMsg = {
      to: customer.phone,
      name: customer.name,
      type,
      message: message || `Hi ${customer.name}! 👋 It's been a while — time for a fresh cut! Book your slot at our shop. 💈`,
      sentAt: new Date(),
      status: "simulated",
    };
    res.json({ success: true, notification: simulatedMsg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
