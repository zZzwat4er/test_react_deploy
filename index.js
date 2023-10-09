const express = require('express');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

const userController = require('./User');
const taskController = require('./Tasks');

app.use('/users', userController);
app.use('/tasks', taskController);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
