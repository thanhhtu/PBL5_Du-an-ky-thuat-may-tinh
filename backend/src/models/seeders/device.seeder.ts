import { AppDataSource } from '../../config/orm.config';
import { DeviceName, DeviceState } from '../../types/device.enum';
import { Device } from '../entities/Device';

async function deviceSeeder() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const deviceRepo = AppDataSource.getRepository(Device);

  const devices = [
    {
      name: DeviceName.DOOR,
      label: 'Huge Austdoor',
      image: 'door.png',
      state: DeviceState.OFF,
    },
    {
      name: DeviceName.LIGHT,
      label: 'Zumtobel',
      image: 'light.png',
      state: DeviceState.OFF,
    },
    {
      name: DeviceName.CURTAIN,
      label: 'Modero Curtain',
      image: 'curtain.png',
      state: DeviceState.OFF,
    },
    {
      name: DeviceName.FAN,
      label: 'Panasonic',
      image: 'fan.png',
      state: DeviceState.OFF,
    },
  ];

  await deviceRepo.save(devices);
}

deviceSeeder().catch((err) => console.error(err));
