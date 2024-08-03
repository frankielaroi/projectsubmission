// src/models/User.js

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
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
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    course: {
        type: String,
        required: true
    },
    yearOfStudy: {
        type: Number,
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        type: String
    },
    emergencyContact: {
        type: String
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
