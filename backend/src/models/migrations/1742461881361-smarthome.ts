import { MigrationInterface, QueryRunner } from 'typeorm';

export class Smarthome1742461881361 implements MigrationInterface {
  name = 'Smarthome1742461881361';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`devices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`label\` varchar(255) NOT NULL, \`image\` varchar(255) NOT NULL, \`state\` enum ('on', 'off') NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`device_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`action\` enum ('turn_on', 'turn_off') NOT NULL, \`previousState\` enum ('on', 'off') NOT NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`ipAddress\` varchar(45) NULL, \`deviceId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`device_logs\` ADD CONSTRAINT \`FK_d2a6bc2c616bbc656e6734e03a4\` FOREIGN KEY (\`deviceId\`) REFERENCES \`devices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`device_logs\` DROP FOREIGN KEY \`FK_d2a6bc2c616bbc656e6734e03a4\``
    );
    await queryRunner.query(`DROP TABLE \`device_logs\``);
    await queryRunner.query(`DROP TABLE \`devices\``);
  }
}
