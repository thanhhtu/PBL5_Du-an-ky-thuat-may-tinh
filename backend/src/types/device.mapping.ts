import { DeviceState } from "./device.enum";

export const COMMAND_MAP: Record<number, string> = {
  1: 'Open the door',
  2: 'Close the door',
  3: 'Turn on the light',
  4: 'Turn off the light',
  5: 'Open the curtain',
  6: 'Close the curtain',
  7: 'Turn on the fan',
  8: 'Turn off the fan',
  [-1]: 'Command not recognized'
}

export const COMMAND_DEVICE_MAP: Record<number, { deviceId: number; state: DeviceState }> = {
  1: { deviceId: 1, state: DeviceState.ON },
  2: { deviceId: 1, state: DeviceState.OFF },
  3: { deviceId: 2, state: DeviceState.ON },
  4: { deviceId: 2, state: DeviceState.OFF },
  5: { deviceId: 3, state: DeviceState.ON },
  6: { deviceId: 3, state: DeviceState.OFF },
  7: { deviceId: 4, state: DeviceState.ON },
  8: { deviceId: 4, state: DeviceState.OFF }
};