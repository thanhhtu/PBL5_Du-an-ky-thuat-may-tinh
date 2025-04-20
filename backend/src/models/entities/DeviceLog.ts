import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { DeviceAction, DeviceState } from '../../types/device.enum';
import { Device } from './Device';

@Entity('device_logs')
export class DeviceLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Device, (device) => device.deviceLogs, {
    onDelete: 'CASCADE',
  })
  device!: Device;

  @Column({ type: 'enum', enum: DeviceAction })
  action!: DeviceAction;

  @Column({ type: 'enum', enum: DeviceState })
  previousState!: DeviceState;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;
}
