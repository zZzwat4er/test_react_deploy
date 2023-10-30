const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');
require("dotenv").config();
const { Extra, Markup } = require('node-telegram-bot-api');

const usersUrl = "https://odd-tan-ox-wig.cyclic.app/users";
const tasksUrl = "https://odd-tan-ox-wig.cyclic.app/tasks";
const token = "6524677471:AAESlMm4JIwXLPmKWFpfVBEJ8kYc2HNg874";
// const token = "6548185763:AAGWd-twLcwMWRxe6O69Bd5s0G4kmfBtWA0"
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

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const taskId = callbackQuery.data.split(':')[1]; // Extract the task ID
  const action = callbackQuery.data.split(':')[2]; // Extract the action ("done" or "edit")

    const status = 'DONE'
    const url = `${'https://odd-tan-ox-wig.cyclic.app/tasks/status'}/${taskId}`;
  


  if (action === 'done') {
    // Update the task status to 'DONE' in the backend
    console.log(taskId)
    try {
      
      const response = await axios.put(url,{status});
      
      // Check if the task status was updated successfully
      if (response.status === 200) {
        bot.sendMessage(chatId, `Task is marked as 'Done'.`);
      } else {
        bot.sendMessage(chatId, `Failed to mark task as 'Done'.`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      bot.sendMessage(chatId, 'An error occurred while updating the task status.');
    }
  }
});


bot.onText(/\/view/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramid = msg.from.id;

  try {
    const url = `${taskstelgramUrl}/${telegramid}`;
    const response = await axios.get(url);
    const Alltasks = response.data;

    const tasks = Alltasks.filter(Alltasks=>Alltasks.status === 'NOT DONE');

    if (tasks.length === 0) {
      bot.sendMessage(chatId, 'No tasks available.');
    }
    else {
      tasks.forEach((task, index) => {
        const taskMessage = `${index + 1}. ${task.message}`;

        const keyboard = {
          inline_keyboard: [
            [
              { text: 'Done', callback_data: `task:${task.taskid}:done` },
              { text: 'Edit', callback_data: `task:${task.taskid}:edit`, switch_inline_query: task.message },
            ],
          ],
        };

        const sendMessageOptions = {
          reply_markup: JSON.stringify(keyboard),
        };

        bot.sendMessage(chatId, taskMessage, sendMessageOptions);
      });
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'An error occurred while fetching tasks.');
  }
});



//  issue 1 for users with enabled security feature to hide nickname, i will get a null object. so it won't work
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const senderId = msg.from.id;
  const forwarder = msg.forward_from;
  let sendersurl = null;
  
  text.trim()

  if (forwarder ) {
      sendersurl =  forwarder.username;
  }
  
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
  