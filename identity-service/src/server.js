require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");

const logger = require("./utils/logger");
const app = express();
const identityRoutes = require("./routes/identity-routes");
const errorHandler = require("./middleware/errorHandler");

const port = process.env.PORT;


// connect to database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        logger.info("Connected to mongodb")
    }).catch(e => {
        logger.error("Mongo connection error", e);
    });


// redis
const redisClient = new Redis(process.env.REDIS_URL)


// middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next();
});


// DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1
});

app.use((req, res, next) => {
    rateLimiter.consume(req.ip)
        .then(() => next()
            .catch((error) => {
                logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
                res.status(429).json({
                    success: false,
                    message: "To many requests"
                });
            }));
});

// IP based rate limiting for api endpoints
const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`)
        res.status(429).json({
            success: false,
            message: "To many requests"
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});


// apply limiter to routes
app.use("/api/auth/register", sensitiveEndpointsLimiter);


// routes
app.use(
    "/api/auth",
    (req, res, next) => {
        req.redisClient = redisClient
        next()
    }, identityRoutes);


// error handler
app.use(errorHandler);


// start server
app.listen(port, () => {
    logger.info(`Identity service running on port ${port}`);
});


// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
    logger.error('Unhandled Rejection at ', promise, "reason: ", reason);
})

