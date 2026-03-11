const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Student = require('../models/Student');

// Get all enrolled courses for a student
router.get('/student/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // 1. Find all enrollments for this student
        const enrollments = await Enrollment.find({ studentId: studentId });

        if (!enrollments.length) {
            return res.json([]);
        }

        // 2. Get the list of courseIds from enrollments
        const courseIds = enrollments.map(e => e.courseId);

        // 3. Find the details for these courses
        const courses = await Course.find({ courseId: { $in: courseIds } });

        // 4. Combine Enrollment info (status, semester) with Course info
        const result = enrollments.map(enrollment => {
            const courseDetails = courses.find(c => c.courseId === enrollment.courseId);
            return {
                ...enrollment._doc,
                courseName: courseDetails?.courseName || 'Unknown Course',
                credits: courseDetails?.credits || 0,
                instructor: courseDetails?.instructor || 'TBA',
                department: courseDetails?.department || 'N/A'
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all students enrolled in a course with their details
router.get('/course/:courseId', async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ courseId: req.params.courseId });

        if (!enrollments.length) {
            return res.json([]);
        }

        const studentIds = enrollments.map(e => e.studentId);
        const students = await Student.find({ studentId: { $in: studentIds } });

        const result = enrollments.map(e => {
            const studentInfo = students.find(s => s.studentId === e.studentId);
            return {
                ...e._doc,
                studentName: studentInfo?.name || 'Unknown',
                photo: studentInfo?.photo || ''
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
