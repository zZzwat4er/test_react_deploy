import logging
import concurrent.futures

from telegram import ReplyKeyboardMarkup, ReplyKeyboardRemove, Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

API_TOKEN = '6548185763:AAGWd-twLcwMWRxe6O69Bd5s0G4kmfBtWA0'

# Enable logging for debugging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# Define states for conversation
TASK, CONFIRMATION = range(2)


async def start(update: Update,  context: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text("Hi there! Send me a message to create a task.")
    return TASK


async def create_task(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user_msg = update.message.text
    # Save task_text to your database or data store
    # You can use context.user_data to store temporary data if needed
    # Replace this with your database logic
    if 'task' in context.user_data:
        context.user_data['task'].extend([user_msg])
    else:
        context.user_data['task'] = [user_msg]

    reply_keyboard = [["Yes", "No"]]

    await update.message.reply_text(
        "Create task from message you send me?",
        reply_markup=ReplyKeyboardMarkup(
            reply_keyboard, one_time_keyboard=True, input_field_placeholder="?"
        ),
    )

    return CONFIRMATION


async def confirm_task(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user_response = update.message.text.lower()
    task_creation_status = 'Task creation cancelled.'
    if user_response == 'yes':
        # Save the task to your database or data store here
        # Replace this with your database logic
        task_creation_status = 'Task created.'
    else:
        context.user_data['task'].pop()

    await update.message.reply_text(task_creation_status)

    return TASK


async def show_tasks(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    report = "You have next tasks:\n\n"
    for i, task in enumerate(context.user_data['task']):
        report += f"{i + 1}. {task}\n\n"
    await update.message.reply_text(
        report
    )

    return TASK


def main():
    """Run the bot."""
    # Create the Application and pass it your bot's token.
    application = Application.builder().token(API_TOKEN).build()

    # Add conversation handler with the states TASK, CONFIRMATION,
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler('start', start)],
        states={
            TASK: [MessageHandler(filters.TEXT & ~(filters.COMMAND | filters.Regex("show")), create_task)],
            CONFIRMATION: [MessageHandler(filters.TEXT & ~(filters.COMMAND | filters.Regex("show")), confirm_task)],
        },
        fallbacks=[MessageHandler(filters.Regex("show"), show_tasks)],
    )

    application.add_handler(conv_handler)

    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Start the bot
        application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()
