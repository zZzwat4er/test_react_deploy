import React, { Component, useContext } from 'react'
import Todo from '../models/Todo'
import { useThemeParams } from '@vkruglikov/react-telegram-web-app'
import axios, { HttpStatusCode } from 'axios';
import { todoContext } from '../App';

export function TodoItem({ todo }) {
  let [sheme, params] = useThemeParams();
  let setTodo = useContext(todoContext)

  function deleteTodo() {
    axios.delete(`https://odd-tan-ox-wig.cyclic.app/tasks/${todo.taskId}`)
      .then(res => {
        if (res.status !== HttpStatusCode.InternalServerError) {
          setTodo(prev => prev.filter(e => e.taskId !== todo.taskId));
        }
      })
      .catch(e => { });
  }

  return (
    <div className='Todo-Item' style={{
      background: params.button_color
    }}>
      <ul >
        <li className='Main-Text'>{todo.message}</li>
        <li onClick={deleteTodo}>{"\u274C"}</li>
        {/* <li className='Status'>{todo.status}</li> */}
      </ul>
    </div>
  )
}
