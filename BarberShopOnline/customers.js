// server/routes/customers.js
const router   = require("express").Router();
const Customer = require("../models/Customer");
const { protect } = require("../middleware/auth");

router.use(protect); // All customer routes protected

// GET /api/customers — list with search
router.get("/", async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = { owner: req.user._id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const customers = await Customer.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Customer.countDocuments(query);
    res.json({ success: true, customers, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/customers/:id
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, owner: req.user._id });
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/customers
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    const customer = await Customer.create({ owner: req.user._id, name, phone, email, notes });
    res.status(201).json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/customers/:id
router.put("/:id", async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, phone, email, notes },
      { new: true }
    );
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/customers/:id/visits — add visit record
router.post("/:id/visits", async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, owner: req.user._id });
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    customer.visits.push(req.body);
    await customer.save();
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/customers/:id
router.delete("/:id", async (req, res) => {
  try {
    await Customer.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
