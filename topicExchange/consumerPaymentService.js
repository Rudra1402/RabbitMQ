// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const QUEUE_NAME = "payments_queue";
const EXCHANGE_NAME = "ecommerce_exchange";

// Methods ------------------------------------------->

async function consumeFromQueue() {
    try {
        // Connect to amqp server
        const connection = await amqp.connect(RABBITMQ_URL);
        if (!connection) {
            console.log("[ ERROR ] Failed to connect to " + RABBITMQ_URL);
            return;
        }

        // Create a channel
        const channel = await connection.createChannel();
        if (!channel) {
            console.log("[ ERROR ] Failed to create a channel");
            return;
        }

        // Assert exchange
        await channel.assertExchange(EXCHANGE_NAME, "topic", {
            durable: false
        });

        // Assert queue
        await channel.assertQueue(QUEUE_NAME, {
            durable: false
        });

        // Bind queue with exchange
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, "payment.*");

        channel.consume(QUEUE_NAME, (message) => {
            if(!message || !message.content) {
                console.log("[ ERROR ] Failed to consume messages from queue: " + QUEUE_NAME);
                return;
            }
            console.log("[ INFO ] Successfully received data: " + message.content);
            channel.ack(message);
        });
    } catch (error) {
        console.log("[ ERROR ] " + error.message);
        return;
    }
}

consumeFromQueue();