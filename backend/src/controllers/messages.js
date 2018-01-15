import winston from 'winston';
import request from 'request-promise';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'TESTING1234';
const PAGE_ACCESS_TOKEN =
  process.env.PAGE_ACCESS_TOKEN || 'TESTING1234 TOKEN NOT SET';
const ENV = process.env.NODE_ENV;

// Handles messages events
async function handleMessage(senderId, message) {
  switch (message.text) {
    case 'start':
      await callSendAPI(senderId, getTarotCardResponse());
      await callSendAPI(senderId, getTarotInterpretation());
      await callSendAPI(senderId, getNextOptions());
      break;
    case 'help':
      await callSendAPI(senderId, {
        text: "say 'start' to begin",
      });
      break;
    default:
      break;
  }
}

// Handles messaging_postbacks events
async function handlePostback(senderId, postback) {
  const {payload} = postback;
  let response;

  switch (payload) {
    case POSTBACK_DONE:
      response = {text: 'Great!'};
      break;
    case POSTBACK_CLARIFICATION:
      response = {text: 'in progress'};
      break;
    default:
      break;
  }
  callSendAPI(senderId, response);
}

async function callSendAPI(sender_psid, response) {
  const requestBody = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };
  if (ENV === 'development') {
    winston.info('Sending message', requestBody);
    return;
  }
  try {
    await request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: PAGE_ACCESS_TOKEN},
      method: 'POST',
      json: requestBody,
    });
    winston.info('Succesfully sent message:', requestBody);
  } catch (err) {
    winston.error('Was not able to send a message: ', err);
  }
}

function getTarotCardResponse() {
  const imgUrl = 'https://i.imgur.com/8cqebYZ.jpg';
  const cardTitle = 'The Three of Dogs';
  const response = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: cardTitle,
            image_url: imgUrl,
          },
        ],
      },
    },
  };
  return response;
}

function getTarotInterpretation() {
  const interpretationString =
    'The three of dogs represents Cerberus, the gatekeeper of the underworld, a.k.a place of pomegranates, a.k.a fruits with too many seeds. Seeds represents potential new growth and the circle of life in which we all die and pass on our genes to the next generation. In other words the three of dogs represents how we all truly feel inside, we just have to be open-minded';

  const response = {
    text: interpretationString,
  };

  return response;
}

const POSTBACK_CLARIFICATION = 'clarification';
const POSTBACK_DONE = 'done';

function getNextOptions() {
  const response = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: 'What would you like to do next?',
            buttons: [
              {
                type: 'postback',
                title: 'Clarifying Card',
                payload: POSTBACK_CLARIFICATION,
              },
              {
                type: 'postback',
                title: "I'm done, thanks",
                payload: POSTBACK_DONE,
              },
            ],
          },
        ],
      },
    },
  };
  return response;
}

export const messageHandler = ctx => {
  const body = ctx.request.body;
  winston.info('Received a message', body);

  if (body.object === 'page') {
    body.entry.forEach(async entry => {
      const webhookEvent = entry.messaging[0];
      const {message, sender, postback} = webhookEvent;
      const senderId = sender.id;
      if (message) {
        handleMessage(senderId, message);
      } else if (postback) {
        handlePostback(senderId, postback);
      }
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
  messageHandler,
};
