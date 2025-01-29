const logger = require("../utils/logger");
const Post = require("../model/post");

const { validatePost } = require("../utils/validation");
const { publishEvent } = require("../utils/rabbitmq");


const invalidatePostCache = async (req, input) => {

    const cachedKey = `post:${input}`;
    await req.redisClient.del(cachedKey);

    const keys = await req.redisClient.keys("posts:*");
    if (keys.length > 0) {
        await req.redisClient.del(keys);
    }
}


// create a post
const createPost = async (req, res) => {
    logger.info('Create Post endpoint hit...');
    try {

        // validate the input
        const { error } = validatePost(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { content, mediaIds } = req.body;

        const newlyCreatedPost = new Post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || [],
        });

        await newlyCreatedPost.save();

        await publishEvent('post.created', {
            postId: newlyCreatedPost._id.toString(),
            userId: newlyCreatedPost.user.toString(),
            content: newlyCreatedPost.content,
            createdAt: newlyCreatedPost.createdAt
        });

        await invalidatePostCache(req, newlyCreatedPost._id.toString());

        logger.info("Post created successfully", newlyCreatedPost);
        res.status(201).json({
            success: true,
            message: "Post created successfully"
        });

    } catch (error) {
        logger.error("Error creating post", error)
        res.status(500).json({
            success: false,
            message: "Error creating post"
        })
    }
}


// get all post
const getAllPost = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const startIndex = (page - 1) * limit;

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPost = await req.redisClient.get(cacheKey);

        if (cachedPost) {
            return res.json(JSON.parse(cachedPost));
        }

        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const total = await Post.countDocuments();

        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        }

        // save post in redis
        await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

        res.json(result);

    } catch (error) {
        logger.error("Error fetching posts", error)
        res.status(500).json({
            success: false,
            message: "Error fetching posts"
        })
    }
}


// get single post
const getPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const cacheKey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cacheKey);

        if (cachedPost) {
            return res.json(JSON.parse(cachedPost));
        }

        const singlePost = await Post.findById(postId);

        if (!singlePost) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        await req.redisClient.setex(cachedPost, 3600, JSON.stringify(singlePost));

        res.json(singlePost);

    } catch (error) {
        logger.error("Error fetching post", error)
        res.status(500).json({
            success: false,
            message: "Error fetching post"
        })
    }
}


// delete post
const deletePost = async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        await publishEvent('post.deleted', {
            postId: post._id.toString(),
            userId: req.user.userId,
            mediaIds: post.mediaIds
        });

        await invalidatePostCache(req, req.params.id);
        res.json({
            message: "Post deleted"
        })

    } catch (error) {
        logger.error("Error deleting post", error)
        res.status(500).json({
            success: false,
            message: "Error deleting post"
        })
    }
}




module.exports = {
    createPost,
    getAllPost,
    getPost,
    deletePost,
}