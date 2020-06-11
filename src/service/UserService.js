const {sendPushNotifications} = require("../util/ExpoPush");

const UserRepo = require("../dao/UserRepo");
const TaskRepo = require("../dao/TaskRepo");

class UserService {
  constructor(db) {
    this.userRepo = new UserRepo(db);
    this.taskRepo = new TaskRepo(db);
  }

  async newUser(req, res) {
    try {
      const result = await this.userRepo.insertOne(req.body);
      res.send(result.ops[0]);
    } catch (e) {
      console.error(e);
      res.send(e);
    }
  };

  async getUser(req, res) {
    try {
      const userId = req.params.userId;
      const result = await this.userRepo.get(userId);
      res.send(result);
    } catch (e) {
      console.error(e);
      res.send(e);
    }
  }

  async getUsers(req, res) {
    try {
      const result = await this.userRepo.getAll(null, null, {name: 1, profilePicUri: 1});
      res.send(result);
    } catch (e) {
      console.error(e);
      res.send(e);
    }
  }

  async getUserTasks(req, res) {
    try {
      const userId = req.params.userId;
      const {tasks} = await this.userRepo.get(userId, ["tasks"]);
      const taskData = {};
      tasks.forEach(task => taskData[task.id] = {completed: task.completed, answers: task.answers});
      const results = await this.taskRepo.getAll(tasks.map(task => task.id));
      results.forEach(result => {
        result.completed = taskData[result._id].completed;
        if (result.completed) result.answers = taskData[result._id].answers;
      });
      res.send(results);
    } catch (e) {
      console.error(e);
      res.send(e);
    }
  }

  async submitForm(req, res) {
    try {
      const userId = req.params.userId;
      const taskId = req.params.taskId;
      const answers = req.body;
      await this.userRepo.update(userId, {"tasks.id": taskId}, "tasks.$.completed", true);
      const updatedTask = await this.userRepo.update(userId, {"tasks.id": taskId}, "tasks.$.answers", answers);
      res.send(updatedTask);
    } catch (e) {
      console.error(e);
      res.send(e);
    }
  }

  async addTaskToAll(req, res) {
    try {
      const taskId = req.params.taskId;
      const result = await this.userRepo.updateAll("tasks", {id: taskId, completed: false}, "push");
      const task = await this.taskRepo.get(taskId);
      const author = await this.userRepo.get(task.authorId, ["name"]);
      const users = await this.userRepo.getAll(null,  {_id: {$nin: [task.authorId]}, pushToken: {$exists: true, $nin: [""]}}, {pushToken: 1});
      await sendPushNotifications({users, title: "New Form", body: `${author.name} has created a new form. Click here to fill it out.`, data: {tab: "tasks", page: "Form", task}});
      res.send(result);
    } catch (e) {
      console.error(e);
      res.send(e);
    }
  }
}

module.exports = UserService;
