const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const amqp = require('amqplib');

const app = express()
const port = 3001

app.use(bodyParser.json())

// create a new db with the name 'tasks' and connect to it
mongoose.connect('mongodb://mongo:27017/tasks')
  .then(() => {
    console.log('Connected to MongoDB')
  }).catch(err => {
    console.error('Could not connect to MongoDB', err)
  })

// Define a simple schema and model for task documents
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
}
});

// create a model based on the schema
const Task = mongoose.model('Task', TaskSchema);

// RabbitMQ setup
let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      connection = await amqp.connect('amqp://rabbitmq');
      channel = await connection.createChannel();
      await channel.assertQueue('taskQueue', { durable: true });
      console.log('Connected to RabbitMQ');
      return;
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

// Endpoint to create a new task
app.post('/tasks', async (req, res) => {

  const { title, description, userId } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({error: 'Title, description and userId are required'});
  }

  try {
    const task = new Task({ title, description, userId });
    await task.save();

    const taskMessage = { taskId: task._id, title, description, userId };
    if (!channel) {
      return res.status(503).json({ error: 'RabbitMQ channel is not established' });
    }

    channel.sendToQueue('taskQueue', Buffer.from(JSON.stringify(taskMessage)), { persistent: true });
    console.log('Task message sent to queue:', taskMessage);

    res.status(201).json(task);
  } catch (error) {
    console.error('Error in creating a task', error);
    res.status(500).json({error: 'Error in creating a task'});
  }
})

// Endpoint to get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({error: 'Error fetching tasks'});
  }
}) 

app.get('/', (req, res) => {
  res.send('Welcome to task service!')
})

app.listen(port, () => {
  console.log(`Task Service listening on port ${port}`)
  connectRabbitMQWithRetry();
})
