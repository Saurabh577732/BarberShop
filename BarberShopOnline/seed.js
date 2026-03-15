// server/seed.js — Run: node seed.js
require("dotenv").config();
const mongoose    = require("mongoose");
const User        = require("./models/User");
const Customer    = require("./models/Customer");
const Service     = require("./models/Service");
const Transaction = require("./models/Transaction");
const Booking     = require("./models/Booking");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/barbershop";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Clean up
  await Promise.all([User.deleteMany(), Customer.deleteMany(), Service.deleteMany(), Transaction.deleteMany(), Booking.deleteMany()]);

  // Create demo owner
  const user = await User.create({
    shopName: "The Cut Lab",
    ownerName: "Raj Sharma",
    email: "demo@barbershop.com",
    password: "demo123",
    phone: "9876543210",
    address: "42, MG Road, Bengaluru",
  });
  console.log("✅ Owner created — email: demo@barbershop.com | password: demo123");

  // Services
  const services = await Service.insertMany([
    { owner: user._id, name: "Classic Haircut", price: 150, duration: 30, category: "haircut" },
    { owner: user._id, name: "Fade + Design", price: 250, duration: 45, category: "haircut" },
    { owner: user._id, name: "Beard Trim", price: 100, duration: 20, category: "beard" },
    { owner: user._id, name: "Head Shave", price: 120, duration: 25, category: "haircut" },
    { owner: user._id, name: "Hair + Beard Combo", price: 300, duration: 60, category: "combo" },
    { owner: user._id, name: "Hair Color",  price: 600, duration: 90, category: "grooming" },
    { owner: user._id, name: "Kids Haircut", price: 100, duration: 20, category: "haircut" },
    { owner: user._id, name: "Dreadlocks", price: 800, duration: 120, category: "grooming" },
  ]);

  // Customers
  const customerNames = [
    ["Arjun Mehta", "9811001122"], ["Rohan Gupta", "9822003344"],
    ["Vikram Nair", "9833005566"], ["Sanjay Patel", "9844007788"],
    ["Amit Kumar", "9855009900"], ["Rahul Singh", "9866001111"],
    ["Deepak Joshi", "9877002222"], ["Priya Reddy", "9888003333"],
    ["Kiran Rao", "9899004444"], ["Suresh Pillai", "9800005555"],
  ];

  const customers = [];
  for (const [name, phone] of customerNames) {
    const visits = [];
    const numVisits = Math.floor(Math.random() * 8) + 1;
    for (let i = 0; i < numVisits; i++) {
      const svc = services[Math.floor(Math.random() * 4)];
      const daysAgo = Math.floor(Math.random() * 90);
      visits.push({
        date: new Date(Date.now() - daysAgo * 86400000),
        service: svc.name,
        price: svc.price,
        barber: ["Raj", "Dev", "Sam"][Math.floor(Math.random() * 3)],
      });
    }
    const c = await Customer.create({ owner: user._id, name, phone, visits });
    customers.push(c);
  }

  // Transactions — past 30 days
  const payMethods = ["cash", "upi", "card"];
  const txs = [];
  for (let d = 30; d >= 0; d--) {
    const count = Math.floor(Math.random() * 6) + 2;
    for (let i = 0; i < count; i++) {
      const c   = customers[Math.floor(Math.random() * customers.length)];
      const svc = services[Math.floor(Math.random() * services.length)];
      txs.push({
        owner: user._id,
        customerName: c.name,
        customerPhone: c.phone,
        serviceName: svc.name,
        price: svc.price,
        paymentMethod: payMethods[Math.floor(Math.random() * payMethods.length)],
        barber: ["Raj", "Dev", "Sam"][Math.floor(Math.random() * 3)],
        date: new Date(Date.now() - d * 86400000),
      });
    }
  }
  await Transaction.insertMany(txs);

  // Today's bookings
  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "15:30", "16:00"];
  const statuses  = ["pending", "confirmed", "completed", "cancelled"];
  for (let i = 0; i < 8; i++) {
    const c   = customers[i % customers.length];
    const svc = services[i % services.length];
    await Booking.create({
      owner: user._id,
      customerName: c.name,
      customerPhone: c.phone,
      serviceName: svc.name,
      servicePrice: svc.price,
      barber: ["Raj", "Dev", "Sam"][i % 3],
      date: new Date(),
      timeSlot: timeSlots[i],
      status: statuses[i % statuses.length],
    });
  }

  console.log(`✅ Seeded: ${services.length} services, ${customers.length} customers, ${txs.length} transactions, 8 bookings`);
  console.log("🚀 Login at: demo@barbershop.com / demo123");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
