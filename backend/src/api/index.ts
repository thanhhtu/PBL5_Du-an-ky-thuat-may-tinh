import express from 'express';
import deviceRoute from './devices/device.router';
import weatherContextRoute from './weatherContext/weatherContext.router';
import aiRoute from './ai/ai.router';

const router = express.Router();

router.use('/devices', deviceRoute);
router.use('/weatherContext', weatherContextRoute);
router.use('/ai', aiRoute);

export default router;
