module.exports = class BaseModel {
  constructor (tableName, keys) {
    this.tableName = tableName;
    this.keys = keys;
  }

  findAll (id = null) {
    return [
      `SELECT *
       FROM public."${this.tableName}"`,
      id ? `WHERE id = ${id}` : null
    ].join('\n');
  }

  insert (data) {
    const keys = Object.keys(data);
    const values = Object.values(data).map(x => (typeof x) === 'string' ? `'${x}'` : x);

    return [
      `INSERT INTO public."${this.tableName}"(${keys.join(', ')})`,
      `VALUES (${values.join(', ')})`
    ].join('\n');
  }

  update (id, column, value) {
    value = typeof value === 'string' ? `'${value}'` : value;

    return [
      `UPDATE public."${this.tableName}"`,
      `SET ${column} = ${value}`,
      `WHERE id = ${id}`
    ].join('\n');
  }

  delete (id) {
    return [
      `DELETE
       FROM public."${this.tableName}"`,
      `WHERE id = ${id}`
    ].join('\n');
  }
};