import objection from 'objection';

import Expense from './Expense';

class User extends objection.Model {
  static get tableName() {
    return 'User';
  }
}

export default User;
