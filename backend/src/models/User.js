import objection from 'objection';

class User extends objection.Model {
  static get tableName() {
    return 'User';
  }
}

export default User;
