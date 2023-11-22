import {TodoItem} from "../components/TodoItem";
import {CompletedItem} from "../components/CompletedItem";
import React, {useEffect, useState} from "react";
import {useAuthContext} from "../hooks/useAuthContext";
import axios from "axios";
import Todo from "../models/Todo";
import Attachment from "../models/Attachment";

export function Home() {
  let [state, setState] = useState([]);
  let [tasks, setTasks] = useState([]);
  let [taskAttachments, setAttachments] = useState([]);
  let {user, _} = useAuthContext();
  let [isCompletedShow, setIsCompletedShow] = useState(false);
  let [isAddModalOpen, setIsAddModalOpen] = useState(false);
  let [newTask, setNewTask] = useState('');
  let [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  let [searchQuery, setSearchQuery] = useState('');

  const toggleShow = async () => {
    setIsCompletedShow(!isCompletedShow);
    await fetchTasks();
  }

  const fetchTasks = async () => {
    try {
      const tasks = await axios.get(`https://odd-tan-ox-wig.cyclic.app/tasks/telegram/${user.id}`);
      const tasksJson = tasks.data;
      tasksJson.sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
      setState(tasksJson.map(e => Todo.from(e)));
      setTasks(tasksJson.map(e => Todo.from(e)));
    } catch (error) {
      setState([]);
    }
  };

  const fetchAttachments = async () => {
    try {
      const attachments = await axios.get(`https://odd-tan-ox-wig.cyclic.app/attachments/telegramid/${user.id}`);
      const attachmentsJson = attachments.data;
      setAttachments(attachmentsJson.map(e => Attachment.from(e)));
    } catch (error) {
      setAttachments([]);
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
      fetchAttachments();
    }
  }, [user?.id]);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewTask('');
  }

  const confirmAddModal = async () => {
    if (newTask.trim() !== '') {
      try {
        await axios.post(`https://odd-tan-ox-wig.cyclic.app/tasks`, {
          message: newTask,
          status: 'NOT DONE',
          senderurl: null,
          userid: user.id
        });
        await fetchTasks();
        closeAddModal();
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }
  }

  const ManageSearchBar = async () => {
    setIsSearchBarOpen(!isSearchBarOpen);
    setSearchQuery('');
    await fetchTasks();
  };

  // Check if there are active tasks
  const hasActiveTasks = state.some((todo) => todo.status === 'NOT DONE');

  // Check if there are completed tasks
  const hasCompletedTasks = state.some((todo) => todo.status === 'DONE');

  const applySearch = async (new_search_value) => {
    setSearchQuery(new_search_value);
    const filteredTasks = state.filter((todo) =>
      todo.message && todo.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setTasks(filteredTasks);
  }

  return (
    <div>
      {/* Floating button for adding new tasks */}
      <div className="FloatingButton" onClick={openAddModal}><div>{"\u2795"}</div></div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="AddModal">
          <textarea
            placeholder="Enter your message..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <div className="ModalButtons">
            <button className="Cancel" onClick={closeAddModal}>Cancel</button>
            <button onClick={confirmAddModal}>Confirm</button>
          </div>
        </div>
      )}

      <div className="SearchBar">
      {isSearchBarOpen && (
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onInputCapture={(e) => applySearch(e.target.value)}
          />
      )}
        <div className="SearchBarBtn">
          <div className="FloatingButton SearchButton" onClick={ManageSearchBar}><div>🔍</div></div>
        </div>
      </div>

      <button className="Show" onClick={toggleShow}>
        {isCompletedShow ? "Show Active Tasks" : "Show Completed Tasks"}
      </button>
      {isCompletedShow ? (
          <div className="Completed">
          {hasCompletedTasks ? (
            tasks
              .filter((todo) => todo.status === 'DONE')
              .map((todo) => <CompletedItem key={todo.taskId} todo={todo} attachments={taskAttachments} fetchTasks={fetchTasks} />)
          ) : (
            <p>No completed tasks</p>
          )}
          </div>
      ) : (
        <div>
          {user ? (
            <div>
              {hasActiveTasks ? (
                tasks
                  .filter((todo) => todo.status === 'NOT DONE')
                  .map((todo) => <TodoItem key={todo.taskId} todo={todo} attachments={taskAttachments}  fetchTasks={fetchTasks} />)
              ) : (
                <p>No active tasks</p>
              )}
            </div>
          ) : (
            <h1>Could not get user ID</h1>
          )}
        </div>
      )}
    </div>
  );
}
