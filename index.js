const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');
require("dotenv").config();
const { Extra, Markup } = require('node-telegram-bot-api');

const usersUrl = "https://odd-tan-ox-wig.cyclic.app/users";
const tasksUrl = "https://odd-tan-ox-wig.cyclic.app/tasks";
const token = "6524677471:AAESlMm4JIwXLPmKWFpfVBEJ8kYc2HNg874";
const taskstelgramUrl = "https://odd-tan-ox-wig.cyclic.app/tasks/telegram";
const attachmentURl = "https://odd-tan-ox-wig.cyclic.app/attachments"
const port = 3000;


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

    if (tasks.length === 0) {
      bot.sendMessage(chatId, 'No tasks available.');
    } else {
      const taskMessages = tasks.map((task) => {
        const senderurl = task.senderurl || '';
        const taskText = `${task.message}${senderurl ? ' @' + senderurl : ''}`;

        // Create an inline keyboard with a button for each task
        const keyboard = {
          inline_keyboard: [
            [
              { text: 'Edit', callback_data: `task:${task.id}` }
            ]
          ]
        };
        // Send the task message with the inline keyboard
        bot.sendMessage(chatId, taskText, { reply_markup: JSON.stringify(keyboard) });
      });
    }

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'An error occurred while fetching tasks.');
  }
});
  

//issue 1 for users with enabled security feature to hide nickname, i will get a null object. so it won't work

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const senderId = msg.from.id;
  const forwarder = msg.forward_from;
  let sendersurl = null;

  if (forwarder ) {
    console.log('foward true')
      sendersurl =  forwarder.username;
  }
  
    console.log('Received message:', text);
    console.log('sender url:', sendersurl);
  
    if (!msg.entities || msg.entities[0].type !== 'bot_command')
     {
    const messageData = {
        message: text,
        status: 'NOT DONE',
        senderurl: sendersurl,
        userid: senderId,
      };

      axios
        .post(tasksUrl, messageData)
        .then((response) => {
          console.log('API response:', response.data);
          bot.sendMessage(chatId, 'Task created successfully');
        })
        .catch((error) => {
          console.error('Error posting data to API:', error);
        });
  
    
    }
  });
  