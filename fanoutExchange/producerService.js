// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE_NAME = "fanout_exchange";

const payload = {
    data: {
        type: "Fanout Exchange",
        desc: "Broadcast message to all bound queues"
    }
};

// Methods ------------------------------------------->

async function publishToExchange(payload) {
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

        // Send data to queue via exchange -> Empty routing key to broadcast message to all queues
        channel.publish(EXCHANGE_NAME, "", Buffer.from(JSON.stringify(payload)));
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

publishToExchange(payload);
