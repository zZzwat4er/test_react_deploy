import React, { useState, useContext } from 'react'
import axios, { HttpStatusCode } from 'axios';
import { todoContext } from '../App';
import { useAnalytics } from '../hooks/useAnalytics';
import { logEvent } from "firebase/analytics";

export function CompletedItem({ todo, attachments, fetchTasks }) {
  const sender = todo.senderUrl ? "\n Sender: " + todo.senderUrl : '';
  const msg = todo.message + sender;
  let [isAttachmentShow, setIsAttachmentShow] = useState(false);

  let setTodo = useContext(todoContext)
  const { analytics } = useAnalytics();

  const TodoAttachments = attachments.filter(attachments => attachments.taskId === todo.taskId);

  function makeActiveSubmit() {
    axios
      .put(`https://odd-tan-ox-wig.cyclic.app/tasks/${todo.taskId}`, {
        status: "NOT DONE",
        message: todo.message,
        reminder: todo.reminder,
      })
      .then((res) => {
        if (res.status !== HttpStatusCode.InternalServerError) {
          fetchTasks();
        }
      })
      .catch((e) => {});
  }

  function deleteCompletedSubmit() {
    axios
      .delete(`https://odd-tan-ox-wig.cyclic.app/tasks/${todo.taskId}`)
      .then((res) => {
        if (res.status !== HttpStatusCode.InternalServerError) {
          fetchTasks();
        }
      })
      .catch((e) => {});
  }

  const toggleAttachment = async () => {
    setIsAttachmentShow(!isAttachmentShow);
  }

  return (
    <div className='Todo-Item'>
        <ul >
          <li className='Main-Text'>{msg}</li>
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
              <li onClick={makeActiveSubmit}>&#128260;</li>
              <li onClick={deleteCompletedSubmit}>&#10060;</li>
            </div>
          </li>
        </ul>
    </div>
  )
}
