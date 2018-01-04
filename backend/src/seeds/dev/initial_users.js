const bcrypt = require('bcryptjs');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('User')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('User').insert([
        {
          firstName: 'John',
          lastName: 'Doe',
          password: bcrypt.hashSync('admin', bcrypt.genSaltSync(10)),
          username: 'admin',
          role: 'admin',
          email: 'admin@test.com',
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          password: bcrypt.hashSync('manager', bcrypt.genSaltSync(10)),
          username: 'manager',
          role: 'manager',
          email: 'b@c.com',
        },
        {
          firstName: 'Jackie',
          lastName: 'Doe',
          password: bcrypt.hashSync('user', bcrypt.genSaltSync(10)),
          username: 'user',
          role: 'user',
          email: 'c@d.com',
        },
      ]);
    });
};
