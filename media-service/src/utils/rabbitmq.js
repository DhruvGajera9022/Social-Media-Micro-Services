const amqp = require("amqplib");

const logger = require("./logger");


let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events';


const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBIT_MQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });
        logger.info("Connected to rabbit mq");

        return channel;
    } catch (error) {
        logger.error("Error connecting to rabbit mq", error);
    }
}


const publishEvent = async (routingKey, message) => {
    if (!channel) {
        await connectRabbitMQ();
    }

    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
    logger.info("Event publish: ", routingKey);
}


const consumeEvent = async (routingKey, callback) => {
    if (!channel) {
        await connectRabbitMQ();
    }

    const q = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    channel.consume(q.queue, (msg) => {
        if (msg !== null) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
    });

    logger.info("Subscribed to event: ", routingKey);
}


module.exports = { connectRabbitMQ, publishEvent, consumeEvent }