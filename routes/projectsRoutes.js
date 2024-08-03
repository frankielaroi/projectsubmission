const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const verifyToken = require('../services/verifyUser');
const upload = require('../config/multer'); // Adjust the path as necessary
const bucket = require('../config/firebase'); // Adjust the path as necessary

// Create a new project submission with file upload
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { title, description, tags, deadline, supervisorId } = req.body;
        let fileUrl = null;

        if (!description || !deadline || !supervisorId) {
            return res.status(400).json({ error: 'Description, deadline, and supervisor are required fields' });
        }

        if (req.file) {
            const blob = bucket.file(Date.now() + '-' + req.file.originalname);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype
                }
            });

            blobStream.on('error', (err) => {
                return res.status(500).send({ error: err.message });
            });

            blobStream.on('finish', async () => {
                fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

                const newProject = new Project({
                    title,
                    description,
                    tags: tags ? tags.split(',') : [], // Convert tags string to array if it exists
                    fileUrl,
                    deadline,
                    supervisor: supervisorId,
                    student: req.user.userID
                });

                await newProject.save();
                res.status(201).json(newProject);
            });

            blobStream.end(req.file.buffer);
        } else {
            const newProject = new Project({
                title,
                description,
                tags: tags ? tags.split(',') : [], // Convert tags string to array if it exists
                fileUrl,
                deadline,
                supervisor: supervisorId,
                student: req.user.userID
            });

            await newProject.save();
            res.status(201).json(newProject);
        }
    } catch (error) {
        if (error instanceof multer.MulterError) {
            console.error('Multer error:', error);
            return res.status(400).json({ error: 'File upload error' });
        }
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project', details: error.message });
    }
});

// Update project by student
router.put('/:id', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { title, description, tags, deadline } = req.body;
        let fileUrl = null;

        if (!description || !deadline) {
            return res.status(400).json({ error: 'Description and deadline are required fields' });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (req.file) {
            const blob = bucket.file(Date.now() + '-' + req.file.originalname);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype
                }
            });

            blobStream.on('error', (err) => {
                return res.status(500).send({ error: err.message });
            });

            blobStream.on('finish', async () => {
                fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

                project.title = title || project.title;
                project.description = description || project.description;
                project.tags = tags ? tags.split(',') : project.tags;
                project.fileUrl = fileUrl;
                project.deadline = deadline || project.deadline;

                await project.save();
                res.status(200).json(project);
            });

            blobStream.end(req.file.buffer);
        } else {
            project.title = title || project.title;
            project.description = description || project.description;
            project.tags = tags ? tags.split(',') : project.tags;
            project.deadline = deadline || project.deadline;

            await project.save();
            res.status(200).json(project);
        }
    } catch (error) {
        if (error instanceof multer.MulterError) {
            console.error('Multer error:', error);
            return res.status(400).json({ error: 'File upload error' });
        }
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project', details: error.message });
    }
});

// Delete project by student
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project', details: error.message });
    }
});

// Update project status by lecturer
router.put('/status/:id', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        project.status = status || project.status;

        await project.save();
        res.status(200).json(project);
    } catch (error) {
        console.error('Error updating project status:', error);
        res.status(500).json({ error: 'Failed to update project status', details: error.message });
    }
});

// Get projects by user
router.get('/user', verifyToken, async (req, res) => {
    try {
        const projects = await Project.find({ student: req.user.userID });
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).json({ error: 'Failed to fetch user projects', details: error.message });
    }
});

// Get projects by supervisor
router.get('/supervisor/', verifyToken, async (req, res) => {
    try {
        const projects = await Project.find({ supervisor: req.user.userID });
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching supervisor projects:', error);
        res.status(500).json({ error: 'Failed to fetch supervisor projects', details: error.message });
    }
});

module.exports = router;