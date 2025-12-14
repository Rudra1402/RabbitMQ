// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const QUEUE_NAME_UNSUBSCRIBED = "email_queue_unsubscribed";

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

        // Assert queue
        await channel.assertQueue(QUEUE_NAME_UNSUBSCRIBED, {
            durable: false
        });

        channel.consume(QUEUE_NAME_UNSUBSCRIBED, (message) => {
            if(!message || !message.content) {
                console.log("[ ERROR ] Failed to consume messages from queue: " + QUEUE_NAME_UNSUBSCRIBED);
                return;
            }
            console.log("[ INFO ] Successfully received data for unsubscribed users: " + message.content);
            channel.ack(message);
        });
    } catch (error) {
        console.log("[ ERROR ] " + error.message);
        return;
    }
}

receiveEmail();