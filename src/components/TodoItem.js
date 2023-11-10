import React, { useState, useContext } from 'react'
import { useThemeParams } from '@vkruglikov/react-telegram-web-app'
import axios, { HttpStatusCode } from 'axios';
import { todoContext } from '../App';
import { useAnalytics } from '../hooks/useAnalytics';
import { logEvent } from "firebase/analytics";

export function TodoItem({ todo, fetchTasks }) {
  let [isEditing, setIsEditing] = useState(false);
  const sender = todo.senderUrl ? "\n Sender: " + todo.senderUrl : '';
  const msg = todo.message + sender;
  let [editedMessage, setEditedMessage] = useState(msg);
  let [scheme, params] = useThemeParams();

  let setTodo = useContext(todoContext)
  const { analytics } = useAnalytics();

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
        console.log(e)
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

  return (
    <div className='Todo-Item' style={{
      background: params.button_color
    }}>
      {isEditing ? (
        <ul className='Edit-Form'>
          {/*<p className='Main-Text'>{todo.message}</p>*/}
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
              <li onClick={handleEditSubmit}>{"\u2705"}</li>
              <li onClick={handleCancelSubmit}>{"\u274C"}</li>
            </div>
          </li>
        </ul>
      ) : (
        <ul >
          <li className='Main-Text'>{editedMessage}</li>
          <li>
            <div className='Edit-Options'>
              <li onClick={toggleEdit}>{"\u270E"}</li>
              <li onClick={completeTodo}>{"\u2705"}</li>
            </div>
          </li>
        </ul>
      )}
    </div>
  )
}
