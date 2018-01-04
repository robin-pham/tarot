import Router from 'koa-router';

import {webhookVerifier, messageLogger} from './controllers/messages';
const router = new Router();

router.get('/webhook', webhookVerifier);
router.post('/webhook', messageLogger);

export default router;
