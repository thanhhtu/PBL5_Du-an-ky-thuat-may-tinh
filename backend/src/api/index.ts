import express from 'express';
import deviceRoute from './devices/device.router';
import aiRoute from './ai/ai.router';

const router = express.Router();

router.use('/devices', deviceRoute);
router.use('/ai', aiRoute);

export default router;
