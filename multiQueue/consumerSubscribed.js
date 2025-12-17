// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE_NAME = "email_exchange_one_to_many";
const ROUTING_KEY_SUBSCRIBED = "routing_key_subscribed";
const QUEUE_NAME_SUBSCRIBED = "email_queue_subscribed";

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

        // Assert queue -> Subscribed Users
        await channel.assertQueue(QUEUE_NAME_SUBSCRIBED, {
            durable: false
        });

        // Bind queue with exchange -> Subscribed Users
        await channel.bindQueue(QUEUE_NAME_SUBSCRIBED, EXCHANGE_NAME, ROUTING_KEY_SUBSCRIBED);

        channel.consume(QUEUE_NAME_SUBSCRIBED, (message) => {
            if(!message || !message.content) {
                console.log("[ ERROR ] Failed to consume messages from queue: " + QUEUE_NAME_SUBSCRIBED);
                return;
            }
            console.log("[ INFO ] Successfully received data for subscribed users: " + message.content);
            channel.ack(message);
        });
    } catch (error) {
        console.log("[ ERROR ] " + error.message);
        return;
    }
}

receiveEmail();