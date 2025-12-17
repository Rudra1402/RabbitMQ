// Modules ------------------------------------------->

const amqp = require("amqplib");

// Globals ------------------------------------------->

const RABBITMQ_URL = "amqp://localhost";
const EXCHANGE_NAME = "email_exchange";
const ROUTING_KEY = "routing_key";

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
        await channel.assertExchange(EXCHANGE_NAME, "topic", {
            durable: false
        });

        // Send data to queue via exchange
        channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(JSON.stringify(payload)));
        console.log("[ INFO ] Data published successfully to queue");

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