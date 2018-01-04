import objection from 'objection';
import Knex from 'knex';
import knexConfig from '../knexfile';

const Model = objection.Model;
const knex = Knex(knexConfig.production);

Model.knex(knex);
