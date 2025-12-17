// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE_NAME = "email_exchange_one_to_many";
const ROUTING_KEY_UNSUBSCRIBED = "routing_key_unsubscribed";
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

        // Assert exchange
        await channel.assertExchange(EXCHANGE_NAME, "direct", {
            durable: false
        });

         // Assert queue -> Unsubscribed Users
        await channel.assertQueue(QUEUE_NAME_UNSUBSCRIBED, {
            durable: false
        });

        // Bind queue with exchange -> Unsubscribed Users
        await channel.bindQueue(QUEUE_NAME_UNSUBSCRIBED, EXCHANGE_NAME, ROUTING_KEY_UNSUBSCRIBED);

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