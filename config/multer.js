const multer = require('multer');
const multerMemoryStorage = multer.memoryStorage();
const bucket = require('./firebase'); // Adjust the path as necessary

const upload = multer({
  storage: multerMemoryStorage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
});

module.exports = upload;
