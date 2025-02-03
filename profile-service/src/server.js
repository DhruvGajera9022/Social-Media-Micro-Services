require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Redis = require("ioredis");
const helmet = require("helmet");

const profileRoutes = require("./routes/profile-route");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { connectRabbitMQ } = require("./utils/rabbitmq");

const app = express();
const port = process.env.PORT;


// connect to database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        logger.info("Connected to mongodb")
    }).catch(e => {
        logger.error("Mongo connection error", e);
    });


// redis
const redisClient = new Redis(process.env.REDIS_URL);


// middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next();
});


// routes
app.use(
    "/api/profile",
    (req, res, next) => {
        req.redisClient = redisClient
        next()
    }, profileRoutes);


app.use(errorHandler);


const startServer = async () => {
    try {
        await connectRabbitMQ();

        // start server
        app.listen(port, () => {
            logger.info(`Profile service running on port ${port}`);
        });
    } catch (error) {
        logger.error("Failed to connect to server", error);
        process.exit(1);
    }
}


startServer();



// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
    logger.error('Unhandled Rejection at ', promise, "reason: ", reason);
})