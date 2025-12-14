// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE_NAME = "email_exchange_one_to_many";
const QUEUE_NAME_SUBSCRIBED = "email_queue_subscribed";
const QUEUE_NAME_UNSUBSCRIBED = "email_queue_unsubscribed";
const ROUTING_KEY_SUBSCRIBED = "routing_key_subscribed";
const ROUTING_KEY_UNSUBSCRIBED = "routing_key_unsubscribed";

const payload = {
    to: "new123@yopmail.com",
    from: "new789@yopmail.com",
    subject: "Welcome to RabbitMQ, New User",
    body: `
        <html>
            <head>
                <title>Email for User</title>
            </head>
            <body>
                Hello New User,<br/><br/>
                Welcome to RabbitMQ! Hope you have a good day!
            </body>
        </html>
    `
};

// Methods ------------------------------------------->

async function sendEmail() {
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

         // Assert queue -> Unsubscribed Users
        await channel.assertQueue(QUEUE_NAME_UNSUBSCRIBED, {
            durable: false
        });

        // Bind queue with exchange -> Subscribed Users
        await channel.bindQueue(QUEUE_NAME_SUBSCRIBED, EXCHANGE_NAME, ROUTING_KEY_SUBSCRIBED);

        // Bind queue with exchange -> Unsubscribed Users
        await channel.bindQueue(QUEUE_NAME_UNSUBSCRIBED, EXCHANGE_NAME, ROUTING_KEY_UNSUBSCRIBED);


        // Send data to queue via exchange
        channel.publish(EXCHANGE_NAME, ROUTING_KEY_UNSUBSCRIBED, Buffer.from(JSON.stringify(payload)));
        console.log("[ INFO ] Data published successfully to unsubscribed queue");

        // Close connection
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.log("[ ERROR ] " + error.message);
        return;
    }
}

sendEmail();