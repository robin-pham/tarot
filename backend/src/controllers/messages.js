const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'TESTING1234';

// Handles messages events
function handleMessage(sender_psid, received_message) {}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {}

export const messageLogger = ctx => {
  const body = ctx.request.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      winston.info('Webhook event:', webhookEvent);

      const senderId = webhookEvent.sender.id;
      winston.info('Sender PSID: ', senderId);
    });
    ctx.status = 200;
    ctx.body = 'Event Received';
    return;
  }
  ctx.status = 404;
  ctx.body = 'Event not from a page subscription';
};

export const webhookVerifier = ctx => {
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
};

export default {
  webhookVerifier,
  messageLogger,
};
