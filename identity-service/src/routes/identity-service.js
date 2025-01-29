const express = require("express");
const router = express.Router();
const { registerUser, loginUser, refreshTokenUser, logoutUser } = require("../controllers/identityController");


// register api
router.post("/register", registerUser);

// login api
router.post("/login", loginUser);

// refresh token api
router.post("/refresh-token", refreshTokenUser);

// logout api
router.post("/logout", logoutUser);


module.exports = router;