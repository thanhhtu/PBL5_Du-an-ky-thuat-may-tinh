import express from 'express';
import deviceRoute from './devices/device.router';

const router = express.Router();
router.use('/devices', deviceRoute);

export default router;