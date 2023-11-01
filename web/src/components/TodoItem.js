import React, { useState, useContext } from 'react'
import { useThemeParams } from '@vkruglikov/react-telegram-web-app'
import axios, { HttpStatusCode } from 'axios';
import { todoContext } from '../App';

export function TodoItem({ todo }) {
  let [isEditing, setIsEditing] = useState(false);
  let [editedMessage, setEditedMessage] = useState(todo.message);
  let [scheme, params] = useThemeParams();

  let setTodo = useContext(todoContext)

  function completeTodo() {
    const status = 'DONE'
    axios.put(`https://odd-tan-ox-wig.cyclic.app/tasks/status/${todo.taskId}`, {status})
      .then(res => {
        if (res.status !== HttpStatusCode.InternalServerError) {
          setTodo(prev => prev.filter(e => e.taskId !== todo.taskId));
        }
      })
      .catch(e => {
        console.log('Failed to delete task')
      });
  }

  function toggleEdit() {
    setIsEditing(!isEditing);
  }

  function handleEditSubmit() {
    axios
      .put(`https://odd-tan-ox-wig.cyclic.app/tasks/${todo.taskId}`, {
        message: editedMessage,
      })
      .then((res) => {
        if (res.status !== HttpStatusCode.InternalServerError) {
          setTodo((prev) =>
            prev.map((e) => (e.taskId === todo.taskId ? { ...e, message: editedMessage } : e))
          );
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
