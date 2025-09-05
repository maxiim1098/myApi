const express = require('express')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

app.use(express.json())

let tasks = []


app.get('/tasks', (req, res) => {
  const { completed } = req.query;

  let filteredTasks = tasks;
  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    filteredTasks = tasks.filter(task => task.completed === isCompleted);
  }

  res.json({
    count: filteredTasks.length,
    tasks: filteredTasks
  });
});

// Get task by ID
app.get('/tasks/:id', (req, res) => {
  const { id } = req.params;

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  res.json(task);
});

// Create new task
app.post('/tasks', (req, res) => {
  const { title, description, completed = false } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Поле "title" является обязательным' });
  }

  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    completed
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// Update task
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body

  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  const updatedTask = {
    ...tasks[taskIndex],
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(completed !== undefined && { completed })
  };

  tasks[taskIndex] = updatedTask;

  res.json(updatedTask);
});

// Delete task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  tasks.splice(taskIndex, 1);

  res.status(204).send();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});