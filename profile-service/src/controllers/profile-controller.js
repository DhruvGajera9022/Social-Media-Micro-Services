const logger = require("../utils/logger");
const { validateForgotPassword } = require("../utils/validation");
const User = require("../model/User");


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






module.exports = {
    getProfile
}