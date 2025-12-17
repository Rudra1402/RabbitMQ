// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE_NAME = "email_exchange";
const QUEUE_NAME = "email_queue";
const ROUTING_KEY = "routing_key";

// Methods ------------------------------------------->

async function receiveEmail() {
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
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

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

receiveEmail();