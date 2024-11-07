const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("Inside the multer => The file I got from the frontend:", file);
        cb(null, path.join(__dirname, '../public/temp/my-uploads')); // Correct path setup
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix +'-'+ file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = { upload };
