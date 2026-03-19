const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Add Course
router.post('/add', async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        await newCourse.save();

        const Student = require('../models/Student');
        const Enrollment = require('../models/Enrollment');

        // Automatically enroll all existing students in the same department
        const matchingStudents = await Student.find({ department: newCourse.department });
        for (const student of matchingStudents) {
            const newEnrollment = new Enrollment({
                studentId: student.studentId,
                courseId: newCourse.courseId,
                semester: student.semester || 'Sem 1',
                academicYear: new Date().getFullYear().toString()
            });
            await newEnrollment.save();
        }

        res.status(201).json(newCourse);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Courses (Optional filter by instructor name)
router.get('/all', async (req, res) => {
    try {
        const { instructor } = req.query;
        let query = {};
        if (instructor) {
            // Space-tolerant, case-insensitive regex to handle name variations (e.g. Mrs. B vs Mrs.B)
            const escapedName = instructor.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special chars
            const fuzzyName = escapedName.split(/\s+/).join('\\s*');
            query.instructor = { $regex: new RegExp(`^${fuzzyName}$`, 'i') };
        }
        const courses = await Course.find(query);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Course
router.delete('/delete/:id', async (req, res) => {
    try {
        const deleted = await Course.findOneAndDelete({ courseId: req.params.id });
        if (!deleted) {
            const byId = await Course.findByIdAndDelete(req.params.id);
            if (!byId) return res.status(404).json({ message: 'Course not found' });
            return res.json({ message: 'Course deleted' });
        }
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Course
router.put('/update/:id', async (req, res) => {
    try {
        const updatedCourse = await Course.findOneAndUpdate(
            { courseId: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedCourse) return res.status(404).json({ message: 'Course not found' });
        res.json(updatedCourse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
