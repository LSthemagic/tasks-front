import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskCost, setTaskCost] = useState('');
  const [taskTimeout, setTaskTimeout] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/tasks');
      if (Array.isArray(response.data)) {
        const orderedTasks = response.data.sort((a, b) => a.presentation_order - b.presentation_order);
        setTasks(orderedTasks);
      } else {
        console.error("A resposta não é um array:", response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas", error);
    }
  };
  

  const createTask = async () => {
    // Verifica se o nome já existe
    if (tasks.some(task => task.task_name === taskName)) {
      alert("Nome da tarefa já existe!");
      return;
    }
    try {
      await axios.post('/tasks', {
        task_name: taskName,
        task_cost: taskCost,
        task_timeout: taskTimeout,
        // Define a ordem de apresentação como o último item da lista
        presentation_order: tasks.length + 1
      });
      setTaskName('');
      setTaskCost('');
      setTaskTimeout('');
      fetchTasks();
    } catch (error) {
      console.error("Erro ao criar tarefa", error);
    }
  };

  const updateTask = async () => {
    if (tasks.some(task => task.task_name === taskName && task.task_id !== editTaskId)) {
      alert("Nome da tarefa já existe!");
      return;
    }
    try {
      await axios.put(`/tasks/${editTaskId}`, {
        task_name: taskName,
        task_cost: taskCost,
        task_timeout: taskTimeout
      });
      setTaskName('');
      setTaskCost('');
      setTaskTimeout('');
      setEditTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error("Erro ao atualizar tarefa", error);
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await axios.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (error) {
        console.error("Erro ao deletar tarefa", error);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTaskId) {
      updateTask();
    } else {
      createTask();
    }
  };

  const handleEdit = (task) => {
    setTaskName(task.task_name);
    setTaskCost(task.task_cost);
    setTaskTimeout(task.task_timeout);
    setEditTaskId(task.task_id);
  };

  const moveTask = async (taskId, direction) => {
    const index = tasks.findIndex(task => task.task_id === taskId);
    if ((index === 0 && direction === 'up') || (index === tasks.length - 1 && direction === 'down')) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedTasks = [...tasks];
    [updatedTasks[index], updatedTasks[targetIndex]] = [updatedTasks[targetIndex], updatedTasks[index]];

    // Mapeia os IDs das tarefas para o formato esperado pela API
    const reorderedTaskIds = updatedTasks.map(task => ({ tasks_id: task.task_id }));

    try {
        await axios.put('/tasks/reorder', reorderedTaskIds);
        fetchTasks();
    } catch (error) {
        console.error("Erro ao reordenar tarefas", error);
    }
};


  return (
    <div>
      <h1>Lista de Tarefas</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome da Tarefa"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Custo da Tarefa"
          value={taskCost}
          onChange={(e) => setTaskCost(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Prazo da Tarefa"
          value={taskTimeout}
          onChange={(e) => setTaskTimeout(e.target.value)}
          required
        />
        <button type="submit">{editTaskId ? "Atualizar Tarefa" : "Adicionar Tarefa"}</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li
            key={task.task_id}
            className={task.task_cost >= 1000 ? "high-cost" : ""}
          >
            <span>{task.task_name}</span> - <span>R${task.task_cost}</span> - <span>{task.task_timeout}</span>
            <button onClick={() => handleEdit(task)}>✏️</button>
            <button onClick={() => deleteTask(task.task_id)}>🗑️</button>
            <button onClick={() => moveTask(task.task_id, 'up')}>⬆️</button>
            <button onClick={() => moveTask(task.task_id, 'down')}>⬇️</button>
          </li>
        ))}
      </ul>
      <button onClick={() => { setEditTaskId(null); setTaskName(''); setTaskCost(''); setTaskTimeout(''); }}>Incluir Nova Tarefa</button>
    </div>
  );
};

export default App;
