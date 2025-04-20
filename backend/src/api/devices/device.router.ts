import express from 'express';
import deviceController from './device.controller';
import validateMiddleware from '../../middlewares/validate.middleware';
import urlValidateMiddleware from '../../middlewares/urlValidate.middleware';
import { uploadImage } from '../../providers/upload.provider';

const route = express.Router();

route.get('/', deviceController.getAllDevices);

route.post('/',
  uploadImage.single('image'),
  validateMiddleware.createDeviceBody,
  deviceController.createDevice
);

route.get('/:id', urlValidateMiddleware.id, deviceController.getDeviceById);

route.get('/:id/logs', deviceController.getDeviceLogs);

route.delete('/:id', urlValidateMiddleware.id, deviceController.deleteDevice);

route.patch('/:id/state',
  urlValidateMiddleware.id,
  validateMiddleware.updateDeviceStateBody,
  deviceController.updateDeviceState
);

export default route;
