const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const UserService = require("./service/UserService");
const TaskService = require("./service/TaskService");
const bodyParser = require('body-parser');

const connectionString = "mongodb+srv://backend:backendisbest@cluster0-q66l6.mongodb.net/test?retryWrites=true&w=majority";

const app = express();
const port = 3000;
app.use(bodyParser.json());


const main = async () => {
  const client = await MongoClient.connect(connectionString, {useUnifiedTopology: true});
  console.log('Connected to Database');
  const db = client.db("scog");
  const userService = new UserService(db);
  const taskService = new TaskService(db);

  app.post('/users', async (req, res) => await userService.newUser.call(userService, req, res));
  app.get('/users', async (req, res) => await userService.getUsers.call(userService, req, res));
  app.get('/users/:userId', async (req, res) => await userService.getUser.call(userService, req, res));
  app.get('/users/:userId/tasks', async (req, res) => await userService.getUserTasks.call(userService, req, res));
  app.post('/users/:userId/tasks/:taskId', async (req, res) => await userService.submitForm.call(userService, req, res));
  app.put('/users/:taskId', async (req, res) => await userService.addTaskToAll.call(userService, req, res));

  app.post('/tasks', async (req, res) => await taskService.newTask.call(taskService, req, res));
  app.get('/tasks', async (req, res) => await taskService.getTasks.call(taskService, req, res));
  app.get('/tasks/:taskId', async (req, res) => await taskService.getTask.call(taskService, req, res));
  app.delete('/tasks/:taskId', async (req, res) => await taskService.deleteTask.call(taskService, req, res));

  app.listen(port,
      () => console.log(`Example app listening at http://localhost:${port}`));
};

main();


