// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE_NAME = "headers_exchange";

// Methods ------------------------------------------->

async function publishToExchange(headers, payload) {
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
        await channel.assertExchange(EXCHANGE_NAME, "headers", {
            durable: false
        });

        // Send data to queue via exchange -> Empty routing key to broadcast message to all queues
        channel.publish(EXCHANGE_NAME, "", Buffer.from(JSON.stringify(payload)), {
            persistent: true,
            headers: headers
        });
        console.log(`[ INFO ] Data published successfully to exchange ${EXCHANGE_NAME}`);

        // Close connection
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.log("[ ERROR ] " + error.message);
        return;
    }
}

publishToExchange(
    {
        "x-match": "all",
        "content-type": "application/json",
        "Accept-Language": "en"
    },
    "Content Type JSON Received!"
);
publishToExchange(
    {
        "x-match": "any",
        "content-type": "application/text",
        "Accept-Language": "es"
    },
    "Content Type TEXT Received!"
);