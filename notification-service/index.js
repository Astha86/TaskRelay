require('dotenv').config();
const express = require('express')
const amqp = require('amqplib');

const app = express()
const port = process.env.PORT || 3002

async function connectRabbitMQWithRetry(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
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

      return; // exit once connected
    } catch (error) {
      console.error(`Failed to connect to RabbitMQ (attempt ${i + 1}):`, error);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('All retry attempts to connect to RabbitMQ have failed.');
      }
    }
  }
}

app.listen(port, () => {
  console.log(`Notification Service listening on port ${port}`)
  connectRabbitMQWithRetry();
})