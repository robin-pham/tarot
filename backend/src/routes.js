import Router from 'koa-router';

import {webhookVerifier, messageHandler} from './controllers/messages';
const router = new Router();

router.get('/webhook', webhookVerifier);
router.post('/webhook', messageHandler);

export default router;
