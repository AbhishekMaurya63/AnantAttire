// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const Analytics = require("../models/Analytics");

// @POST Create Analytics Entry
router.post("/", async (req, res) => {
  try {
    const analytics = new Analytics(req.body);
    const saved = await analytics.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/reports", async (req, res) => {
  try {
    const { type, timezone } = req.query; 
    // type = "avg-visitor" | "uniq-visitor" | "localTime"

    const tz = timezone || "UTC";

    const dateProjection = {
      date: {
        $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: tz },
      },
      week: {
        $dateToString: { format: "%Y-%U", date: "$timestamp", timezone: tz },
      },
      month: {
        $dateToString: { format: "%Y-%m", date: "$timestamp", timezone: tz },
      },
      hour: {
        $dateToString: { format: "%H", date: "$timestamp", timezone: tz },
      },
      visitorId: 1,
    };

    if (type === "avg-visitor") {
      // Total visitors per day, week, month
      const daily = await Analytics.aggregate([
        { $project: dateProjection },
        { $group: { _id: "$date", totalVisitors: { $sum: 1 } } },
      ]);
      const weekly = await Analytics.aggregate([
        { $project: dateProjection },
        { $group: { _id: "$week", totalVisitors: { $sum: 1 } } },
      ]);
      const monthly = await Analytics.aggregate([
        { $project: dateProjection },
        { $group: { _id: "$month", totalVisitors: { $sum: 1 } } },
      ]);

      return res.json({
        dailyAvg: daily.reduce((a, b) => a + b.totalVisitors, 0) / (daily.length || 1),
        weeklyAvg: weekly.reduce((a, b) => a + b.totalVisitors, 0) / (weekly.length || 1),
        monthlyAvg: monthly.reduce((a, b) => a + b.totalVisitors, 0) / (monthly.length || 1),
      });
    }

    if (type === "uniq-visitor") {
      // Unique visitors per day, week, month
      const daily = await Analytics.aggregate([
        { $project: dateProjection },
        { $group: { _id: "$date", uniqueVisitors: { $addToSet: "$visitorId" } } },
        { $project: { uniqueCount: { $size: "$uniqueVisitors" } } },
      ]);
      const weekly = await Analytics.aggregate([
        { $project: dateProjection },
        { $group: { _id: "$week", uniqueVisitors: { $addToSet: "$visitorId" } } },
        { $project: { uniqueCount: { $size: "$uniqueVisitors" } } },
      ]);
      const monthly = await Analytics.aggregate([
        { $project: dateProjection },
        { $group: { _id: "$month", uniqueVisitors: { $addToSet: "$visitorId" } } },
        { $project: { uniqueCount: { $size: "$uniqueVisitors" } } },
      ]);

      return res.json({
        dailyAvg: daily.reduce((a, b) => a + b.uniqueCount, 0) / (daily.length || 1),
        weeklyAvg: weekly.reduce((a, b) => a + b.uniqueCount, 0) / (weekly.length || 1),
        monthlyAvg: monthly.reduce((a, b) => a + b.uniqueCount, 0) / (monthly.length || 1),
      });
    }

    if (type === "localTime") {
      // Hourly visitors (timezone-aware)
      const hourly = await Analytics.aggregate([
        { $project: dateProjection },
        { $group: { _id: "$hour", totalVisitors: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      return res.json(hourly);
    }

    res.status(400).json({ error: "Invalid type. Use ?type=avg-visitor | uniq-visitor | localTime" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// @GET Analytics by ID
router.get("/:id", async (req, res) => {
  try {
    const data = await Analytics.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @DELETE Analytics by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Analytics.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
