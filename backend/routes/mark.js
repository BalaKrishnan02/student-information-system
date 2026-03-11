const express = require('express');
const router = express.Router();
const Mark = require('../models/Mark');

// Add Marks
router.post('/add', async (req, res) => {
    try {
        const newMark = new Mark(req.body);
        await newMark.save();
        res.status(201).json(newMark);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Marks for Student
router.get('/student/:studentId', async (req, res) => {
    try {
        const marks = await Mark.find({ studentId: req.params.studentId });
        res.json(marks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Marks by Course (for Teacher View)
router.get('/course/:courseId', async (req, res) => {
    try {
        const marks = await Mark.find({ courseId: req.params.courseId });
        res.json(marks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update or Create Mark
router.post('/update', async (req, res) => {
    try {
        const { studentId, courseId, examType, marks, grade, gradePoints } = req.body;

        let markRecord = await Mark.findOne({ studentId, courseId, examType });

        if (markRecord) {
            markRecord.marks = marks;
            markRecord.grade = grade;
            markRecord.gradePoints = gradePoints || 0;
            await markRecord.save();
        } else {
            markRecord = new Mark({ studentId, courseId, examType, marks, grade, gradePoints: gradePoints || 0 });
            await markRecord.save();
        }
        res.json(markRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
