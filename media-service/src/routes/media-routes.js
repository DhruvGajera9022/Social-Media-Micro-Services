const express = require("express");
const multer = require("multer");

const router = express.Router();
const { uploadMedia, getAllMedia } = require("../controllers/media-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");
const logger = require("../utils/logger");


// multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single('file');



router.post("/upload", authenticateRequest, (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            logger.error("Multer error while uploading: ", err)
            return res.status(400).json({
                message: "Multer error while uploading",
                error: err.message,
                stack: err.stack
            })
        } else if (err) {
            logger.error("Unknown error while uploading: ", err)
            return res.status(400).json({
                message: "Unknown error while uploading",
                error: err.message,
                stack: err.stack
            })
        }

        if (!req.file) {
            return res.status(400).json({
                message: "No file found"
            })
        }

        next();
    })
}, uploadMedia);


router.get("/get", authenticateRequest, getAllMedia);


module.exports = router;