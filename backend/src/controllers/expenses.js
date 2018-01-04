import winston from 'winston';
import objection from 'objection';
import Expense from '../models/Expense';
import User from '../models/User';

const {transaction} = objection;
const earliestDate = new Date('Jan 1 1000').toISOString();
const latestDate = new Date('Jan 1 9999').toISOString();

function getUserId(ctx) {
  let ownerId;
  const {id, isAdmin} = ctx.user;
  if (isAdmin && ctx.request.body.ownerId) {
    ownerId = ctx.request.body.ownerId;
  } else {
    ownerId = id;
  }
  return ownerId;
}

async function createExpense(ctx) {
  try {
    const ownerId = getUserId(ctx);

    await transaction(User.knex(), async trx => {
      const user = await User.query(trx).findById(ownerId);
      if (!user) {
        throw new Error('User not found');
      }
      const result = await user
        .$relatedQuery('Expense')
        .insert(ctx.request.body);
      ctx.body = result;
      ctx.status = 201;
    });
  } catch (e) {
    winston.error(e);
    ctx.status = 500;
    ctx.body = {error: e.detail || 'Unknown error'};
  }
}

async function getExpenses(ctx) {
  try {
    let {minDate = earliestDate, maxDate = latestDate} = ctx.request.query;
    const ownerId = getUserId(ctx);

    if (ctx.user.isAdmin && !ctx.request.body.ownerId) {
      const result = await Expense.query();
      ctx.status = 200;
      ctx.body = result;
      return;
    }

    await transaction(User.knex(), async trx => {
      const user = await User.query(trx).findById(ownerId);
      if (!user) {
        throw new Error('User not found');
      }
      const result = await user
        .$relatedQuery('Expense')
        .skipUndefined()
        .whereBetween('date', [minDate, maxDate]);
      ctx.body = result;
      ctx.status = 200;
    });
  } catch (e) {
    winston.error(e);
    ctx.status = 500;
    ctx.body = {error: e.detail || 'Unknown error'};
  }
}

async function deleteExpense(ctx) {
  try {
    const ownerId = getUserId(ctx);
    const {id: expenseId} = ctx.request.body;

    const result = await Expense.query().where('id', '=', expenseId);
    if (!result || result.length <= 0) {
      ctx.status = 404;
      ctx.body = {
        error: 'No expense found for the given id',
      };
      return;
    }

    if (result[0].ownerId !== ownerId && !ctx.user.isAdmin) {
      ctx.status = 403;
      ctx.body = {
        error: 'You do not have permission to delete this expense',
      };
      return;
    }

    const expense = await Expense.query()
      .where('id', '=', expenseId)
      .del();
    if (!expense) {
      ctx.status = 404;
      ctx.body = {error: 'Expense not found for this user'};
    }
    ctx.status = 204;
  } catch (e) {
    throw new Error(e);
  }
}

async function editExpense(ctx) {
  try {
    const {id: expenseId} = ctx.request.body;
    if (!expenseId) {
      ctx.status = 400;
      ctx.body = {
        error: 'No expense id given',
      };
      return;
    }

    const ownerId = getUserId(ctx);

    const result = await Expense.query().where('id', '=', expenseId);
    if (!result || result.length <= 0) {
      ctx.status = 404;
      ctx.body = {
        error: 'No expense found for the given id',
      };
      return;
    }

    if (result[0].ownerId !== ownerId && !ctx.user.isAdmin) {
      ctx.status = 403;
      ctx.body = {
        error: 'You do not have permission to edit this expense',
      };
      return;
    }

    await Expense.query()
      .where('id', '=', expenseId)
      .update(ctx.request.body);

    const updated = await Expense.query().where('id', '=', expenseId);

    if (!updated) {
      throw new Error('Failed to update expense');
    }

    ctx.body = updated[0];
    ctx.status = 200;
    return;
  } catch (e) {
    winston.error(e);
    ctx.status = 500;
    ctx.body = {error: e};
  }
}

export default {
  createExpense,
  getExpenses,
  deleteExpense,
  editExpense,
};
