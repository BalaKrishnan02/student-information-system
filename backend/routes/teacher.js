const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateQR } = require('../utils/generateQR');

// Add Teacher
router.post('/add', async (req, res) => {
    try {
        const teacherData = req.body;

        // 1. Create Teacher record
        const newTeacher = new Teacher(teacherData);
        await newTeacher.save();

        // 2. Automatically create a User record for login
        // Check if user already exists
        const existingUser = await User.findOne({ username: teacherData.teacherId });
        if (!existingUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('teacher123', salt);

            const newUser = new User({
                username: teacherData.teacherId,
                password: hashedPassword,
                role: 'teacher',
                profileId: newTeacher._id
            });
            await newUser.save();

            // Generate QR Code
            await generateQR(teacherData.teacherId, 'teacher');
        }

        res.status(201).json(newTeacher);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Teachers
router.get('/all', async (req, res) => {
    try {
        const teachers = await Teacher.find().sort({ teacherId: 1 });
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Teacher by ID
router.get('/:teacherId', async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ teacherId: req.params.teacherId });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Teacher
router.delete('/delete/:id', async (req, res) => {
    try {
        const deleted = await Teacher.findOneAndDelete({ teacherId: req.params.id });
        if (!deleted) {
            const byId = await Teacher.findByIdAndDelete(req.params.id);
            if (!byId) return res.status(404).json({ message: 'Teacher not found' });
            await User.findOneAndDelete({ username: byId.teacherId });
            return res.json({ message: 'Teacher deleted' });
        }
        await User.findOneAndDelete({ username: deleted.teacherId });
        res.json({ message: 'Teacher deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Teacher
router.put('/update/:id', async (req, res) => {
    try {
        const updatedTeacher = await Teacher.findOneAndUpdate(
            { teacherId: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedTeacher) return res.status(404).json({ message: 'Teacher not found' });

        if (req.body.teacherId && req.params.id !== req.body.teacherId) {
            await generateQR(req.body.teacherId, 'teacher');
        } else {
            await generateQR(updatedTeacher.teacherId, 'teacher');
        }

        res.json(updatedTeacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
