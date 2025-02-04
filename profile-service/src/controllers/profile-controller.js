const logger = require("../utils/logger");
const { validateProfile } = require("../utils/validation");
const User = require("../model/User");


const invalidatePostCache = async (req, input) => {

    const cachedKey = `user:${input}`;
    await req.redisClient.del(cachedKey);

    const keys = await req.redisClient.keys("user:*");
    if (keys.length > 0) {
        await req.redisClient.del(keys);
    }
}


// get profile data
const getProfile = async (req, res) => {
    logger.info("Get Profile endpoint hit...");
    try {
        const cacheKey = "user:profile";
        const cachedProfile = await req.redisClient.get(cacheKey);

        if (cachedProfile) {
            return res.json(JSON.parse(cachedProfile));
        }

        const user = await User.findOne({ _id: req.user.userId });
        if (!user) {
            logger.warn("User not found");
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // save post in redis
        await req.redisClient.setex(cacheKey, 300, JSON.stringify(user));

        logger.warn("Data found");
        res.status(201).json({
            success: true,
            user
        })
    } catch (error) {
        logger.error("Get Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server error"
        })
    }
}


// edit profile
const editProfile = async (req, res) => {
    logger.info("Edit Profile endpoint hit...");
    try {
        const cacheKey = "user:profile";

        const { error } = validateProfile(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { username, email } = req.body;

        const user = await User.findOne({ _id: req.user.userId });
        if (!user) {
            logger.warn("User not found");
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        await user.updateOne({ username, email });

        await invalidatePostCache(req, user._id.toString());

        logger.warn("Profile updated successfully");
        res.status(201).json({
            success: true,
            user
        });

    } catch (error) {
        logger.error("Edit Profile Error: ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server error"
        })
    }
}



module.exports = {
    getProfile,
    editProfile,
}