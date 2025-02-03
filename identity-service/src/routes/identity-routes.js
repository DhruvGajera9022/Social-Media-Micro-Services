const express = require("express");
const router = express.Router();
const { registerUser, loginUser, refreshTokenUser, logoutUser, forgotPasswordUser } = require("../controllers/identity-controller");


// register api
router.post("/register", registerUser);

// login api
router.post("/login", loginUser);

// refresh token api
router.post("/refresh-token", refreshTokenUser);

// forgot password
router.post("/forgot-password", forgotPasswordUser);

// logout api
router.post("/logout", logoutUser);


module.exports = router;