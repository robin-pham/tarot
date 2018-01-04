require('dotenv').config({path: '../../.env'});
const path = require('path');

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds', 'dev'),
    },
  },
  production: {
    client: 'postgresql',
    connection: {
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds', 'prod'),
    },
  },
};
