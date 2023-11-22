import React, {useState, useContext, useEffect} from 'react'
import axios, { HttpStatusCode } from 'axios';
import { todoContext } from '../App';
import { useAnalytics } from '../hooks/useAnalytics';
import { logEvent } from "firebase/analytics";
import Sender from './Sender';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

export function TodoItem({ todo, attachments, fetchTasks }) {
  let [isEditing, setIsEditing] = useState(false);
  const sender = todo.senderUrl;
  const msg = todo.message;
  let [editedMessage, setEditedMessage] = useState(msg);
  let [isAttachmentShow, setIsAttachmentShow] = useState(false);
  let [date, setDate] = useState(null); //useState(new Date());
  let [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);

  let setTodo = useContext(todoContext)
  const { analytics } = useAnalytics();

  const updateReminder = async (newReminder) => {
    try {
      // console.log(newReminder.toJSON());
      const newTime = newReminder.toISOString();
      setDate(newReminder);
      await axios.put(`https://odd-tan-ox-wig.cyclic.app/tasks/reminder/${todo.taskId}`, {newTime})
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const toggleDateTimePicker = async () => {
    setIsDateTimePickerVisible(!isDateTimePickerVisible);
    if (!isDateTimePickerVisible) { await fetchTasks();}
  };

  const TodoAttachments = attachments.filter(attachments => attachments.taskId === todo.taskId);

  function completeTodo() {
    const status = 'DONE'
    axios.put(`https://odd-tan-ox-wig.cyclic.app/tasks/status/${todo.taskId}`, {status})
      .then(res => {
        if (res.status !== HttpStatusCode.InternalServerError) {
          logEvent(analytics, 'onDone')
          // setTodo(prev => prev.filter(e => e.taskId !== todo.taskId));
          fetchTasks();
        }
      })
      .catch(e => {
        console.error(e)
      });
  }

  function toggleEdit() {
    setIsEditing(!isEditing);
  }

  function handleEditSubmit() {
    axios
      .put(`https://odd-tan-ox-wig.cyclic.app/tasks/${todo.taskId}`, {
        message: editedMessage,
        status: todo.status,
        reminder: todo.reminder,
      })
      .then((res) => {
        if (res.status !== HttpStatusCode.InternalServerError) {
          fetchTasks();
          setIsEditing(false);
        }
      })
      .catch((e) => {});
  }

  function handleCancelSubmit() {
    setIsEditing(false);
    setEditedMessage(todo.message);
  }

  const toggleAttachment = async () => {
    setIsAttachmentShow(!isAttachmentShow);
  }

  return (
    <div className='Todo-Item'>
      {isEditing ? (
        <ul className='Edit-Form'>
          <li><Sender senderUrl={sender}/></li>
          <li>
            <input
              type='text'
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              autoFocus
            />
          </li>
          <li>
            <div className='Accept-Options'>
              {isDateTimePickerVisible ? (
                <li><DateTimePicker onChange={updateReminder} clearIcon={null} value={date} /></li>
              ) : (
                <span></span>
              )}
              <li onClick={toggleDateTimePicker}>{"\u23f0"}</li>
              <li onClick={handleEditSubmit}>{"\u2705"}</li>
              <li onClick={handleCancelSubmit}>{"\u274C"}</li>
            </div>
          </li>
        </ul>
      ) : (
        <ul>
          <li><Sender senderUrl={sender}/></li>
          <li className='Main-Text'>{editedMessage}</li>
          <li className='Attachment'>
            {(TodoAttachments.length > 0) ? (
                <div>
                  {isAttachmentShow ? (
                    <img src={TodoAttachments[0].file} alt="attachment" onClick={toggleAttachment} />
                  ) : (
                    <div onClick={toggleAttachment}>see attachment</div>
                  )}
                </div>
            ) : (<div></div>)}
          </li>
          <li>
            <div className='Edit-Options'>
              {isDateTimePickerVisible ? (
                <li><DateTimePicker onChange={updateReminder} clearIcon={null} value={date} /></li>
              ) : (
                <span></span>
              )}
              <li onClick={toggleDateTimePicker}>{"\u23f0"}</li>
              <li onClick={toggleEdit}>{"\u270E"}</li>
              <li onClick={completeTodo}>{"\u2705"}</li>
            </div>
          </li>
        </ul>
      )}
    </div>
  )
}
