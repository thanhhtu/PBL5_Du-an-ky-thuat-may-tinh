import express from 'express';
import deviceController from './device.controller';
import validateMiddleware from '../../middleware/validate.middleware';
import urlValidateMiddleware from '../../middleware/urlValidate.middleware';
import { uploadStorage } from '../../middleware/upload.middleware';

const route = express.Router();

route.get('/', deviceController.getAllDevices);

route.post('/',
  uploadStorage.single('image'),
  validateMiddleware.createDeviceBody,
  deviceController.createDevice
);

route.get('/:id', 
  urlValidateMiddleware.id,
  deviceController.getDeviceById
);

route.get('/:id/logs', deviceController.getDeviceLogs);

route.delete('/:id', 
  urlValidateMiddleware.id,
  deviceController.deleteDevice
);

route.patch('/:id/state', 
  urlValidateMiddleware.id,
  validateMiddleware.updateDeviceStateBody,
  deviceController.updateDeviceState
);

export default route;