import chai from 'chai';
import chaiHttp from 'chai-http';
// import Knex from 'knex';

// import knexConfig from '../knexfile';
// import server from '../app';
// import {baseApiUri} from '../routes';

// const knex = Knex(knexConfig.development);
chai.use(chaiHttp);
chai.should();

describe('Functional Tests -', function() {
  it('test', async () => {
    const test = 1 + 1;
    test * 2;
  });
});
