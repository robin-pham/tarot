import Router from 'koa-router';
import winston from 'winston';

const router = new Router();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'TESTING1234';

router.get('/webhook', ctx => {
  const {query} = ctx;
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
  const {body} = ctx.request;
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

export default router;
