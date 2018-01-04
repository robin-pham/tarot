const bcrypt = require('bcryptjs');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('User')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('User').insert([
        {
          firstName: 'admin',
          lastName: 'admin',
          password: bcrypt.hashSync('admin', bcrypt.genSaltSync(10)),
          username: 'admin',
          role: 'admin',
          email: 'admin@test.com',
        },
      ]);
    });
};
