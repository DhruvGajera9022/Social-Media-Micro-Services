const logger = require("../utils/logger");
const { validateForgotPassword } = require("../utils/validation");
const User = require("../model/User");



const getProfile = async (req, res) => {
    logger.info("Get Profile endpoint hit...");
    try {
        const user = await User.findOne({ _id: req.user.userId });
        if (!user) {
            logger.warn("User not found");
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

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