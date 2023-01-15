module.exports = class BaseController {
  constructor (name, model) {
    this.name = name;
    this.model = model;
  }

  insert (data) {
    this.model.insert(data);
  }

  update (id, key, value) {
    this.model.update(id, key, value);
  }

  delete (id) {
    this.model.delete(id);
  }

  findAll (id) {
    this.model.findAll(id);
  }
};