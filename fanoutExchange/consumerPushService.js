// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE_NAME = "fanout_exchange";

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
        await channel.assertExchange(EXCHANGE_NAME, "fanout", {
            durable: false
        });

        // Assert queue - Passing empty queue name - Temp queue name assigned by RMQ broker
        // This is just to learn about the object returned by "assertQueue()"
        const queue = await channel.assertQueue("", {
            durable: false
        });

        // Bind queue with exchange
        await channel.bindQueue(queue.queue, EXCHANGE_NAME, "");

        channel.consume(queue.queue, (message) => {
            if(!message || !message.content) {
                console.log("[ ERROR ] Failed to consume messages from queue: " + queue.queue);
                return;
            }
            console.log("[ INFO ] Successfully received data: " + message.content + ". Push Queue: " + queue.queue);
            channel.ack(message);
        });
    } catch (error) {
        console.log("[ ERROR ] " + error.message);
        return;
    }
}

consumeFromQueue();