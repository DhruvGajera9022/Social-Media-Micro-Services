const logger = require("../utils/logger");
const { validateRegistration, validateLogin, validateForgotPassword } = require("../utils/validation");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const RefreshToken = require("../models/RefreshToken");
const argon2 = require("argon2");



// user registration
const registerUser = async (req, res) => {
    logger.info('Registration endpoint hit...');

    try {
        const cacheKey = "user:profile";

        // validate the input
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { username, email, password } = req.body;

        let user = await User.findOne({ $or: [{ email }, { username }] })
        if (user) {
            logger.warn("User already exists");
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        user = new User({ username, email, password });
        await user.save();

        logger.warn("User saved successfully", user._id);

        const { accessToken, refreshToken } = await generateToken(user);

        // save post in redis
        await req.redisClient.setex(cacheKey, 300, JSON.stringify(user));

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            accessToken,
            refreshToken
        });

    } catch (error) {
        logger.error("Registration error occurred", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// user login
const loginUser = async (req, res) => {
    logger.info('Registration endpoint hit...');
    try {
        const cacheKey = "user:profile";

        // validate input
        const { error } = validateLogin(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;

        // check user is exist or not
        let user = await User.findOne({ email })
        if (!user) {
            logger.warn("Invalid user");
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // compare password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            logger.warn("Invalid password");
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        const { accessToken, refreshToken } = await generateToken(user);

        // save post in redis
        await req.redisClient.setex(cacheKey, 300, JSON.stringify(user));

        res.json({
            accessToken,
            refreshToken,
            userId: user._id
        });
    } catch (error) {
        logger.error("Login error occurred", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// user token
const refreshTokenUser = async (req, res) => {
    logger.info("Refresh Token endpoint hit...");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn("Refresh Token missing")
            return res.status(400).json({
                success: false,
                message: "Refresh Token missing",
            });
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            logger.warn("Invalid or expired Refresh Token")

            return res.status(401).json({
                success: false,
                message: "Invalid or expired Refresh Token",
            });
        }

        const user = await User.findById(storedToken.user)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateToken(user);

        // delete old tokens
        await RefreshToken.deleteOne({ _id: storedToken._id });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        logger.error("Refresh Token error occurred", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// user forgot password
const forgotPasswordUser = async (req, res) => {
    logger.info("Forgot Password endpoint hit...");
    try {
        const { error } = validateForgotPassword(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;

        // check user is exist or not
        let user = await User.findOne({ email })
        if (!user) {
            logger.warn("User not found");
            return res.status(400).json({
                success: false,
                message: "User not found, Please check credentials"
            });
        }

        const hashedPassword = await argon2.hash(password);
        await user.updateOne({ password: hashedPassword });

        logger.warn("Password updated");
        res.status(201).json({
            success: true,
            message: "Password Updated"
        });

    } catch (error) {
        logger.error("Forgot Password error occurred", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// user logout
const logoutUser = async (req, res) => {
    logger.info("Logout endpoint hit...");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn("Refresh Token missing")
            return res.status(400).json({
                success: false,
                message: "Refresh Token missing",
            });
        }

        await RefreshToken.deleteOne({ token: refreshToken });
        logger.info("Refresh Token deleted from logout");

        res.json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        logger.error("Logout error occurred", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


module.exports = {
    registerUser,
    loginUser,
    refreshTokenUser,
    forgotPasswordUser,
    logoutUser
}