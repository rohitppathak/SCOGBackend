const ObjectID = require('mongodb').ObjectID;

class TaskRepo {
  constructor(db) {
    this.tasks = db.collection("tasks");
  }

  async insertOne(task) {
    task.questions.forEach(q => q._id = new ObjectID());
    const result = await this.tasks.insertOne(task);
    return result;
  }

  async getAll(ids) {
    if (ids) ids = ids.map(id => new ObjectID(id));
    const result = await this.tasks.find(ids && {_id: { $in: ids }});
    const data = await result.toArray();
    return data;
  }

  async get(taskId) {
    const result = await this.tasks.findOne({_id: new ObjectID(taskId)});
    return result;
  }

  async delete(taskId) {
    const result = await this.tasks.deleteOne({_id: new ObjectID(taskId)});
    return result;
  }
}

module.exports = TaskRepo;
