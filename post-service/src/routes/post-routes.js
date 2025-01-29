const express = require("express");
const router = express.Router();
const { createPost, deletePost, getAllPost, getPost } = require("../controllers/post-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");


router.use(authenticateRequest);


// create post
router.post("/create-post", createPost);

// get all posts
router.get("/posts", getAllPost);

// get all post
router.get("/:id", getPost);

// delete post
router.delete("/:id", deletePost);


module.exports = router;
