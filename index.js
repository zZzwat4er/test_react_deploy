<<<<<<< HEAD
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');
require("dotenv").config();

const usersUrl = "https://odd-tan-ox-wig.cyclic.app/users";
const tasksUrl = "https://odd-tan-ox-wig.cyclic.app/tasks";
const token = "6524677471:AAESlMm4JIwXLPmKWFpfVBEJ8kYc2HNg874";
const taskstelgramUrl = "https://odd-tan-ox-wig.cyclic.app/tasks/telegram";
const port = 3002;


const bot = new TelegramBot(token, {polling: true});


const app = express();
app.get('/',(req,res)=> 
{
  res.send('msg2task bot running');
}
);
app.listen(port, () => {
  console.log('server is running');
});


bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userid = msg.from.id;
    const userName = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');

    const userData = {
      telegramid: userid,
      username: userName,
      email: "default@email.com",
      password: "12345"
    }

  axios
  .post(usersUrl, userData)
  .then((response) => {
    console.log('API response:', response.data);
  })
  .catch((error) => {
    console.error('Error posting data to API:', error);
  });
  
  bot.sendMessage(chatId, 'Welcome! Send a task.');
});


bot.onText(/\/view/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramid = msg.from.id; 
    try {
      const url = `${taskstelgramUrl}/${telegramid}`;
      const response = await axios.get(url);
      const tasks = response.data;
      console.log(tasks);
  
      if (tasks.length === 0) {
        bot.sendMessage(chatId, 'No tasks available.');
      } else {
        const taskMessages = tasks.map((task) => task.message);
        bot.sendMessage(chatId, 'Here are your tasks:\n' + taskMessages.join('\n'));
      }
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'An error occurred while fetching tasks.');
    }
  });
  

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const senderId = msg.from.id; 
  
    console.log('Received message:', text);
  
    if (!msg.entities || msg.entities[0].type !== 'bot_command')
     {
    const messageData = {
        message: text,
        status: senderId,
        userid: senderId,
      };

      axios
        .post(tasksUrl, messageData)
        .then((response) => {
          console.log('API response:', response.data);
        })
        .catch((error) => {
          console.error('Error posting data to API:', error);
        });
  
    
    }
  });
  
=======
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
>>>>>>> api-server