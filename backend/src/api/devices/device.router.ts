import express from 'express';
import deviceController from './device.controller';
import validateMiddleware from '../../middlewares/validate.middleware';
import urlValidateMiddleware from '../../middlewares/urlValidate.middleware';
import { uploadImage } from '../../providers/upload.provider';

const route = express.Router();

route.route('/')
  .get(deviceController.getAllDevices)
  .post(
    uploadImage.single('image'),
    validateMiddleware.createDeviceBody,
    deviceController.createDevice
  );

route.patch('/all/state',
  validateMiddleware.updateDeviceStateBody,
  deviceController.updateAllDevicesState
);

route.route('/:id')
  .get(
    urlValidateMiddleware.id, 
    deviceController.getDeviceById
  )
  .delete(
    urlValidateMiddleware.id, 
    deviceController.deleteDevice
  );

route.get('/:id/logs', deviceController.getDeviceLogs);

route.patch('/:id/state',
  urlValidateMiddleware.id,
  validateMiddleware.updateDeviceStateBody,
  deviceController.updateDeviceState
);

export default route;
