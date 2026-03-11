const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateQR } = require('../utils/generateQR');

const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'profile/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Add Student
router.post('/add', upload.single('photo'), async (req, res) => {
    try {
        const studentData = req.body;
        if (req.file) {
            studentData.photo = req.file.filename;
        }

        // 1. Create Student record
        const newStudent = new Student(studentData);
        await newStudent.save();

        // 2. Automatically create a User record for login
        // Check if user already exists
        const existingUser = await User.findOne({ username: studentData.studentId });
        if (!existingUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('student123', salt);

            const newUser = new User({
                username: studentData.studentId,
                password: hashedPassword,
                role: 'student',
                profileId: newStudent._id
            });
            await newUser.save();

            // Generate QR Code
            await generateQR(studentData.studentId, 'student');
        }

        // 3. Automatically enroll the student in corresponding active courses 
        //    (so they show up in the Teacher Dashboard)
        const Course = require('../models/Course');
        const Enrollment = require('../models/Enrollment');

        const matchingCourses = await Course.find({
            department: studentData.department,
            status: 'Active'
        });

        for (const course of matchingCourses) {
            const existingEnrollment = await Enrollment.findOne({
                studentId: studentData.studentId,
                courseId: course.courseId
            });

            if (!existingEnrollment) {
                const newEnrollment = new Enrollment({
                    studentId: studentData.studentId,
                    courseId: course.courseId,
                    semester: studentData.semester || 'Sem 1',
                    academicYear: new Date().getFullYear().toString()
                });
                await newEnrollment.save();
            }
        }

        res.status(201).json(newStudent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Students
router.get('/all', async (req, res) => {
    try {
        const students = await Student.find().sort({ studentId: 1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Student by studentId or _id
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.id }) || await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Student
router.put('/update/:id', upload.single('photo'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.photo = req.file.filename;
        }

        const updatedStudent = await Student.findOneAndUpdate(
            { studentId: req.params.id },
            updateData,
            { new: true }
        ); // fallback if not found by string id, try _id

        if (!updatedStudent) {
            // try by _id
            const byId = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!byId) return res.status(404).json({ message: 'Student not found' });

            if (updateData.studentId && req.params.id !== updateData.studentId) {
                await generateQR(updateData.studentId, 'student');
            } else {
                await generateQR(byId.studentId, 'student');
            }
            return res.json(byId);
        }

        if (updateData.studentId && req.params.id !== updateData.studentId) {
            await generateQR(updateData.studentId, 'student');
        } else {
            await generateQR(updatedStudent.studentId, 'student');
        }

        res.json(updatedStudent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Student
router.delete('/delete/:id', async (req, res) => {
    try {
        const deleted = await Student.findOneAndDelete({ studentId: req.params.id });
        if (!deleted) {
            const byId = await Student.findByIdAndDelete(req.params.id);
            if (!byId) return res.status(404).json({ message: 'Student not found' });
            await User.findOneAndDelete({ username: byId.studentId });
            return res.json({ message: 'Student deleted' });
        }
        await User.findOneAndDelete({ username: deleted.studentId });
        res.json({ message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
