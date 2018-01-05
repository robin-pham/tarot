import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import winston from 'winston';
import objection from 'objection';
import Knex from 'knex';

import knexConfig from './knexfile';
import router from './routes';

const Model = objection.Model;
const env = process.env.NODE_ENV;
const dbConfig =
  env === 'production' ? knexConfig.production : knexConfig.development;
const knex = Knex(dbConfig);
Model.knex(knex);

const app = new Koa();
const port = process.env.API_PORT || 8080;

app.use(bodyParser());
app.use(router.routes());

const server = app.listen(port, () => {
  winston.info(`The app has started on port: ${port} 🚀👍🚀`);
});
export default server;
