// server/routes/dashboard.js
const router      = require("express").Router();
const Booking     = require("../models/Booking");
const Transaction = require("../models/Transaction");
const Customer    = require("../models/Customer");
const { protect } = require("../middleware/auth");

router.use(protect);

// GET /api/dashboard/stats — overview KPIs
router.get("/stats", async (req, res) => {
  try {
    const ownerId = req.user._id;
    const now = new Date();

    // Today
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    // This week (Mon–Sun)
    const dow = now.getDay() || 7;
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - dow + 1); weekStart.setHours(0,0,0,0);
    const weekEnd   = new Date(now); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999);

    // This month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [todayBookings, pendingBookings, totalCustomers,
           todayRevenue, weekRevenue, monthRevenue,
           todayTx, recentBookings] = await Promise.all([
      Booking.countDocuments({ owner: ownerId, date: { $gte: todayStart, $lte: todayEnd } }),
      Booking.countDocuments({ owner: ownerId, status: "pending" }),
      Customer.countDocuments({ owner: ownerId }),
      Transaction.aggregate([{ $match: { owner: ownerId, date: { $gte: todayStart, $lte: todayEnd } } }, { $group: { _id: null, total: { $sum: "$price" } } }]),
      Transaction.aggregate([{ $match: { owner: ownerId, date: { $gte: weekStart,  $lte: weekEnd  } } }, { $group: { _id: null, total: { $sum: "$price" } } }]),
      Transaction.aggregate([{ $match: { owner: ownerId, date: { $gte: monthStart, $lte: monthEnd } } }, { $group: { _id: null, total: { $sum: "$price" } } }]),
      Transaction.countDocuments({ owner: ownerId, date: { $gte: todayStart, $lte: todayEnd } }),
      Booking.find({ owner: ownerId }).sort({ createdAt: -1 }).limit(5).select("customerName serviceName timeSlot date status"),
    ]);

    res.json({
      success: true,
      stats: {
        todayBookings,
        pendingBookings,
        totalCustomers,
        todayRevenue:  todayRevenue[0]?.total  || 0,
        weekRevenue:   weekRevenue[0]?.total   || 0,
        monthRevenue:  monthRevenue[0]?.total  || 0,
        todayServices: todayTx,
        recentBookings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/revenue-chart — 30 days daily revenue
router.get("/revenue-chart", async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(); since.setDate(since.getDate() - days + 1); since.setHours(0,0,0,0);

    const data = await Transaction.aggregate([
      { $match: { owner: req.user._id, date: { $gte: since } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          revenue: { $sum: "$price" },
          count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with 0
    const filled = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      const found = data.find((r) => r._id === key);
      filled.push({
        date: key,
        revenue: found?.revenue || 0,
        count:   found?.count   || 0,
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      });
    }
    res.json({ success: true, data: filled });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/payment-breakdown
router.get("/payment-breakdown", async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: "$paymentMethod", total: { $sum: "$price" }, count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/top-services
router.get("/top-services", async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: "$serviceName", revenue: { $sum: "$price" }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
