const express = require("express");

const { searchController } = require("../controllers/search-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateRequest);



router.get("/posts", searchController);

module.exports = router;