import express from 'express';
import weatherContextController from './weatherContext.controller';

const route = express.Router();

route.get('/', weatherContextController.getTempHumid);

export default route;
