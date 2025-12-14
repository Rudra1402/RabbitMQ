// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE_NAME = "ecommerce_exchange";
const ROUTING_KEY_ORDER_PLACED = "order.placed";
const ROUTING_KEY_ORDER_CANCELLED = "order.cancelled";
const ROUTING_KEY_PAYMENT_SUCCESS = "payment.success";

const payload = (routingKey) => {
    const label = `Queue consumed message for routing key ${routingKey}`;
    const payload = {
        label: label
    };

    return payload;
};

// Methods ------------------------------------------->

async function publishToExchange(routingKey, payload) {
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

        // Send data to queue via exchange
        channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(payload)));
        console.log(`[ INFO ] Data published successfully to exchange ${EXCHANGE_NAME} with routing key ${routingKey}`);

        // Close connection
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.log("[ ERROR ] " + error.message);
        return;
    }
}

publishToExchange(ROUTING_KEY_ORDER_PLACED, payload(ROUTING_KEY_ORDER_PLACED));
publishToExchange(ROUTING_KEY_ORDER_CANCELLED, payload(ROUTING_KEY_ORDER_CANCELLED));
publishToExchange(ROUTING_KEY_PAYMENT_SUCCESS, payload(ROUTING_KEY_PAYMENT_SUCCESS));
