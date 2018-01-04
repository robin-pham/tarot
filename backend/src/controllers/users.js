import winston from 'winston';
import objection from 'objection';

import {encryptPass, encodeToken, verifyPass} from '../utils/auth';
import User from '../models/User';

const {transaction} = objection;

function sanitizeUser(user) {
  const sanitized = Object.assign({}, user);
  delete sanitized.password;
  return sanitized;
}

async function login(ctx) {
  const {username, password} = ctx.request.body;
  if (!username) {
    ctx.status = 400;
    ctx.body = {
      error: 'No username given',
    };
    return;
  }

  const users = await User.query().where('username', '=', username);
  const user = users[0];

  if (!user || !verifyPass(password, user.password)) {
    ctx.status = 401;
    ctx.body = {
      error: 'Incorrect username or password',
    };
    return;
  }

  ctx.status = 200;
  ctx.body = {
    token: encodeToken(sanitizeUser(user)),
    user: sanitizeUser(user),
  };
}

async function createUser(ctx, role) {
  const body = ctx.request.body;
  try {
    const {username, password, email} = body;
    if (!username || !password || !email) {
      ctx.status = 400;
      ctx.body = {
        error: 'A username, password and email are required',
      };
      return;
    }

    const user = await transaction(User.knex(), trx => {
      const encrypted = encryptPass(password);
      return User.query(trx).insert(
        Object.assign({}, body, {password: encrypted, role}),
      );
    });

    ctx.status = 201;
    ctx.body = {
      token: encodeToken(sanitizeUser(user)),
      user: sanitizeUser(user),
    };
  } catch (e) {
    winston.error(e);
    ctx.status = 500;
    ctx.body = {error: e.detail || 'Unknown error'};
  }
}

async function signup(ctx) {
  await createUser(ctx, 'user');
}

async function getUsers(ctx) {
  try {
    const users = await User.query();
    const sanitizedUsers = users.map(sanitizeUser);

    ctx.status = 200;
    ctx.body = {
      users: sanitizedUsers,
    };
  } catch (e) {
    winston.error(e);
    ctx.status = 500;
    ctx.body = {error: e};
  }
}

async function getUser(ctx) {
  try {
    const {id} = ctx.params;
    const user = await User.query().where('id', '=', id);
    if (!user || user.length === 0) {
      ctx.status = 404;
      ctx.body = {
        error: 'No users found',
      };
      return;
    }
    ctx.status = 200;
    ctx.body = sanitizeUser(user[0]);
  } catch (e) {
    winston.error(e);
    ctx.status = 500;
    ctx.body = {error: e};
  }
}

async function editUser(ctx) {
  try {
    const {id} = ctx.params;
    if (!id) {
      ctx.status = 400;
      ctx.body = {
        error: 'No user id given',
      };
      return;
    }

    const {password} = ctx.request.body;

    const users = await User.query().where('id', '=', id);
    if (!users || users.length === 0) {
      ctx.status = 404;
      ctx.body = {
        error: 'No users found with this id',
      };
      return;
    }

    const newFields = Object.assign({}, ctx.request.body);
    if (password) {
      newFields.password = encryptPass(password);
    }

    const patchedUser = await User.query().patchAndFetchById(id, newFields);

    ctx.status = 200;
    ctx.body = sanitizeUser(patchedUser);
  } catch (e) {
    winston.error(e);
    ctx.status = 500;
    ctx.body = {error: e.details || 'Unknown Error'};
  }
}

async function deleteUser(ctx) {
  try {
    const {id} = ctx.params;
    if (!id) {
      ctx.status = 400;
      ctx.body = {
        error: 'No user id given',
      };
      return;
    }

    await User.query()
      .where('id', '=', id)
      .del();
    ctx.status = 204;
  } catch (e) {
    winston.error(e);
    ctx.status = 500;
    ctx.body = {error: e};
  }
}

async function handleCreateUser(ctx) {
  await createUser(ctx, ctx.request.body.role);
}

export default {
  login,
  signup,
  getUsers,
  getUser,
  editUser,
  deleteUser,
  handleCreateUser,
};
