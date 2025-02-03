const express = require("express");
const router = express.Router();

const { authenticateRequest } = require("../middlewares/authMiddleware");


module.exports = router;