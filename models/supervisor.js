// src/models/Supervisor.js

const mongoose = require('mongoose');

const SupervisorSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String
    },
    profilePicture: {
        type: String
    },
    department: {
        type: String,
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Supervisor', SupervisorSchema);
