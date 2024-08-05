const express = require('express');
const router = express.Router();
const Supervisor = require('../models/supervisor');
const verifyToken = require('../services/verifyUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

// Create a new supervisor
router.post('/', async (req, res) => {
    try {
        const { fullName, email, contactNumber, department, password } = req.body;

        // Validate required fields
        if (!fullName || !email || !contactNumber || !department || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the supervisor
        const newSupervisor = new Supervisor({
            fullName,
            email,
            contactNumber,
            department,
            password: hashedPassword
        });

        await newSupervisor.save();
        res.status(201).json("User Created");
    } catch (error) {
        console.error('Error creating supervisor:', error);
        res.status(500).json({ error: 'Failed to create supervisor' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await Supervisor.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'An error occurred during login' });
    }

});// Get all supervisors
router.get('/', verifyToken, async (req, res) => {
    try {
        const supervisors = await Supervisor.find();
        res.status(200).json(supervisors);
    } catch (error) {
        console.error('Error fetching supervisors:', error);
        res.status(500).json({ error: 'Failed to get supervisors' });
    }
});

// Get a specific supervisor by ID
router.get('/single/', verifyToken, async (req, res) => {
    try {
        const supervisor = await Supervisor.findById(req.user.userID);
        if (!supervisor) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }
        res.status(200).json(supervisor);
    } catch (error) {
        console.error('Error fetching supervisor:', error);
        res.status(500).json({ error: 'Failed to get supervisor' });
    }
});

// Update a supervisor
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { fullName, email, contactNumber, department, password } = req.body;

        // If password is being updated, hash it
        if (password) {
            req.body.password = await bcrypt.hash(password, 10);
        }

        const supervisor = await Supervisor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!supervisor) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }
        res.status(200).json(supervisor);
    } catch (error) {
        console.error('Error updating supervisor:', error);
        res.status(500).json({ error: 'Failed to update supervisor' });
    }
});

// Delete a supervisor
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const supervisor = await Supervisor.findByIdAndDelete(req.params.id);
        if (!supervisor) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }
        res.status(200).json({ message: 'Supervisor deleted successfully' });
    } catch (error) {
        console.error('Error deleting supervisor:', error);
        res.status(500).json({ error: 'Failed to delete supervisor' });
    }
});

module.exports = router;
