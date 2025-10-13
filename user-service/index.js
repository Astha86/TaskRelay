const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

app.use(bodyParser.json())

// create a new db with the name 'users' and connect to it
mongoose.connect('mongodb://mongo:27017/users')
  .then(() => {
    console.log('Connected to MongoDB')
  }).catch(err => {
    console.error('Could not connect to MongoDB', err)
  })

// Define a simple schema and model for user documents
const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});

// create a model based on the schema
const User = mongoose.model('User', UserSchema);

// Endpoint to create a new user
app.post('/users', async (req, res) => {

  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({error: 'Name and email are required'});
  }
  try {
    const user = new User({ name, email });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({error: 'Error creating user'});
  }
})

// Endpoint to get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({error: 'Error fetching users'});
  }
}) 

app.get('/', (req, res) => {
  res.send('Welcome to user service!')
})

app.listen(port, () => {
  console.log(`User Service listening on port ${port}`)
})
