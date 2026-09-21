import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShelfDescription1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "shelves" ADD "description" varchar(280)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "shelves" DROP COLUMN "description"');
  }
}
