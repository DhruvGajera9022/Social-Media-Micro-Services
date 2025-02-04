const express = require("express");
const router = express.Router();

const { authenticateRequest } = require("../middlewares/authMiddleware");
const { getProfile } = require("../controllers/profile-controller");


// get profile data
router.get("/get-profile", authenticateRequest, getProfile);

// update profile
router.get("/edit-profile", authenticateRequest);


module.exports = router;