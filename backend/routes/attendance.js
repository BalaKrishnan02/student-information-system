const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Bulk Mark Attendance (Update if exists, otherwise create)
router.post('/bulk-mark', async (req, res) => {
    try {
        const { records, courseId, date } = req.body;

        const operations = records.map(record => ({
            updateOne: {
                filter: { studentId: record.studentId, courseId, date: new Date(date) },
                update: { status: record.status },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);
        res.status(200).json({ message: 'Attendance updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Attendance for Course and Date
router.get('/course/:courseId/date/:date', async (req, res) => {
    try {
        const { courseId, date } = req.params;
        const records = await Attendance.find({
            courseId,
            date: new Date(date)
        });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Cumulative Stats for all students in a course
router.get('/course-stats/:courseId', async (req, res) => {
    try {
        const stats = await Attendance.aggregate([
            { $match: { courseId: req.params.courseId } },
            {
                $group: {
                    _id: "$studentId",
                    present: {
                        $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
                    },
                    absent: {
                        $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] }
                    }
                }
            }
        ]);

        // Convert to map for frontend convenience
        const statsMap = {};
        stats.forEach(s => {
            statsMap[s._id] = { present: s.present, absent: s.absent };
        });
        res.json(statsMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Attendance for Student
router.get('/student/:studentId', async (req, res) => {
    try {
        const records = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
