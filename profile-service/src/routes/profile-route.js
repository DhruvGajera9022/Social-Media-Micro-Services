const express = require("express");
const router = express.Router();

const { authenticateRequest } = require("../middlewares/authMiddleware");
const { getProfile, editProfile } = require("../controllers/profile-controller");


// get profile data
router.get("/get-profile", authenticateRequest, getProfile);

// update profile
router.post("/edit-profile", authenticateRequest, editProfile);


module.exports = router;