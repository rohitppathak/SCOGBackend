const TaskRepo = require("../dao/TaskRepo");
const UserRepo = require("../dao/UserRepo");

class TaskService {
  constructor(db) {
    this.taskRepo = new TaskRepo(db);
    this.userRepo = new UserRepo(db);
  }

  async newTask(req, res) {
    try {
      const result = await this.taskRepo.insertOne(req.body);
      res.send(result.ops[0]);
    } catch (e) {
      console.error(e);
      res.send(e);
    }
  };

  async getTasks(req, res) {
    try {
      const result = await this.taskRepo.getAll();
      res.send(result);
    } catch (e) {
      console.error(e);
      res.send(e);
    }
  }

  async getTask(req, res) {
    try {
      const taskId = req.params.taskId;
      const task = await this.taskRepo.get(taskId);
      const users = await this.userRepo.getAll(null, {"tasks.id": taskId}, {name: 1, tasks: {$elemMatch: {id: taskId}}});
      const questionMap = {};
      task.questions.forEach(q => {
        const options = {};
        q.options && q.options.forEach(option => options[option] = 0);
        q.options = options;
        questionMap[q._id] = q;
      });
      const notSubmitted = [];
      const submitted = [];
      users.forEach(user => {
        const taskInfo = user.tasks[0];
        if (taskInfo.completed) {
          submitted.push({id: user._id, name: user.name});
          Object.entries(taskInfo.answers).forEach(([questionId, answer]) => {
            if (questionMap[questionId].answerStyle === "cb") {
              answer.forEach(val => questionMap[questionId].options[val] += 1);
            } else {
              if (!questionMap[questionId].options[answer])
                questionMap[questionId].options[answer] = 0;
              questionMap[questionId].options[answer] += 1;
            }
          })
        } else {
          notSubmitted.push({id: user._id, name: user.name});
        }
      });
      const result = {submitted, notSubmitted, questionMap};
      res.send(result);
    } catch (e) {
      console.error(e);
      res.send(e);
    }
  }

  async deleteTask(req, res) {
    try {
      const taskId = req.params.taskId;
      const result = await this.taskRepo.delete(taskId);
      await this.userRepo.updateAll("tasks", {id: taskId}, "pull");
      res.send(result);
    } catch (e) {
      console.error(e);
      res.send(e);
    }
  }
}

module.exports = TaskService;
