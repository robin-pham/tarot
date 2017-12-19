const Koa = require('koa');
const winston = require('winston');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');

const port = process.env.API_PORT || 8080;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'TESTING1234';

const app = new Koa();
const router = new Router();

router.get('/', ctx => {
  winston.info('is this working?');
  ctx.status = 200;
  ctx.body = 'Hello World!';
});

router.get('/webhook', ctx => {
  const { query } = ctx;
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];
  winston.info('query', query);

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      winston.info('Webhook verified');
      ctx.status = 200;
      ctx.body = challenge;
    } else {
      ctx.status = 403;
    }
  }
});

router.post('/webhook', ctx => {
  const { body } = ctx.request;
  winston.info('whats in the body', body);
  if (body.object === 'page') {
    body.entry.forEach(entry => {
      winston.info('Webhook event:', entry.messaging[0]);
    });
    ctx.body = 'Event Received!';
    ctx.status = 200;
  } else {
    ctx.status = 404;
  }
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  winston.info(`The app has started on port: ${port} 🚀👍🚀`);
});
