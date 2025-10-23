require('dotenv').config();
const amqp = require('amqplib');

async function start() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URI);
    const channel = await connection.createChannel();
    await channel.assertQueue('taskQueue', { durable: true });
    console.log('Notification Service connected to RabbitMQ');

    channel.consume('taskQueue', (msg) => {
      if (msg !== null) {
        const task = JSON.parse(msg.content.toString());
        console.log('Received task:', task);
        // Here you can add code to send email or any other notification logic
        channel.ack(msg);
      }
    }, { noAck: false });

  } catch (error) {
    console.error('Error in Notification Service:', error);
  }
}

start();