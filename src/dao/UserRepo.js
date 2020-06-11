const ObjectID = require('mongodb').ObjectID;

class UserRepo {
  constructor(db) {
    this.users = db.collection("users");
  }

  async insertOne(user) {
    const result = await this.users.insertOne(user);
    return result;
  }

  async get(userId, fields = []) {
    const projection = {};
    fields.forEach(field => projection[field] = 1);
    const result = await this.users.findOne({_id: new ObjectID(userId)}, {projection});
    return result;
  }

  async getAll(userIds, filters, projection) {
    const query = userIds ? {_id: { $in: userIds }, ...filters} : filters;
    const result = await this.users.find(query, {projection});
    const data = await result.toArray();
    return data;
  }

  async update(userId, filters, field, item, type = "replace") {
    if (type === "push") {
      const result = await this.users.updateOne({_id: new ObjectID(userId), ...filters}, {$push: {[field]: item}});
      return result;
    } else {
      const result = await this.users.updateOne({_id: new ObjectID(userId), ...filters}, {$set: {[field]: item}});
      return result;
    }
  }

  async updateAll(field, item, type = "replace") {
    if (type === "push") {
      const result = await this.users.updateMany({}, {$push: {[field]: item}});
      return result;
    } else if (type === "pull") {
      const result = await this.users.updateMany({}, {$pull: {[field]: item}});
      return result;
    } else {
      throw new Error("Unsupported");
    }
  }
}

module.exports = UserRepo;
