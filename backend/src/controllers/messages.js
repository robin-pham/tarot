import winston from 'winston';
import request from 'request-promise';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'TESTING1234';
const PAGE_ACCESS_TOKEN =
  process.env.PAGE_ACCESS_TOKEN || 'TESTING1234 TOKEN NOT SET';

/*
// Handles messages events
function handleMessage(sender_psid, received_message) {}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {}
*/

async function callSendAPI(sender_psid, response) {
  const requestBody = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };
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
  const interpretationString = 'This is an interpretation of your card. The .';

  const response = {
    text: interpretationString,
  };

  return response;
}

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
                title: 'Get a Clarifying Card',
                payload: 'clarification',
              },
              {
                type: 'postback',
                title: "I'm done",
                payload: 'done',
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
  winston.info('received a message', body);

  if (body.object === 'page') {
    body.entry.forEach(async entry => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;
      winston.info('Sender PSID: ', senderId);
      await callSendAPI(senderId, getTarotCardResponse());
      await callSendAPI(senderId, getTarotInterpretation());
      await callSendAPI(senderId, getNextOptions());
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
