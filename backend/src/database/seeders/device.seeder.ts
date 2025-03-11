import { AppDataSource } from "../../config/orm.config";
import { DeviceName, DeviceState } from "../../types/device.enum";
import { Device } from "../entities/Device";

async function deviceSeeder(){
  if(!AppDataSource.isInitialized){
    await AppDataSource.initialize();
  }

  const deviceRepo = AppDataSource.getRepository(Device);

  const devices = [
    {
      name: DeviceName.DOOR,
      label: 'Huge Austdoor',
      image: './backend/src/public/upload/door.png',
      state: DeviceState.OFF,
    },
    {
      name: DeviceName.CURTAIN,
      label: 'Modero Curtain',
      image: './backend/src/public/upload/curtain.png',
      state: DeviceState.OFF,
    },
    {
      name: DeviceName.FAN,
      label: 'Panasonic',
      image: './backend/src/public/upload/fan.png',
      state: DeviceState.OFF,
    },
    {
      name: DeviceName.LIGHT,
      label: 'Zumtobel',
      image: './backend/src/public/upload/light.png',
      state: DeviceState.OFF,
    },
  ];

  await deviceRepo.save(devices);
}

deviceSeeder().catch((err) => console.error(err));