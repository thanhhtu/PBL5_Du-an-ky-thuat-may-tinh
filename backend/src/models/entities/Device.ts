import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { DeviceLog } from './DeviceLog';
import { DeviceState } from '../../types/device.enum';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  label!: string;

  @Column({ type: 'varchar', length: 255 })
  image!: string;

  @Column({ type: 'enum', enum: DeviceState })
  state!: DeviceState;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => DeviceLog, (deviceLog) => deviceLog.device, {
    onDelete: 'CASCADE',
  })
  deviceLogs!: DeviceLog[];
}
