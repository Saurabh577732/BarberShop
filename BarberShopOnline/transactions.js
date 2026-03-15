// server/routes/transactions.js
const router      = require("express").Router();
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/auth");

router.use(protect);

// GET /api/transactions
router.get("/", async (req, res) => {
  try {
    const { search, method, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = { owner: req.user._id };
    if (method) query.paymentMethod = method;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { serviceName:  { $regex: search, $options: "i" } },
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate)   query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Transaction.countDocuments(query);

    // Aggregate totals
    const agg = await Transaction.aggregate([
      { $match: { owner: req.user._id, ...query } },
      { $group: { _id: null, totalRevenue: { $sum: "$price" }, count: { $sum: 1 } } },
    ]);
    res.json({ success: true, transactions, total, summary: agg[0] || { totalRevenue: 0, count: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/transactions
router.post("/", async (req, res) => {
  try {
    const tx = await Transaction.create({ owner: req.user._id, ...req.body });
    res.status(201).json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/transactions/:id
router.put("/:id", async (req, res) => {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!tx) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
