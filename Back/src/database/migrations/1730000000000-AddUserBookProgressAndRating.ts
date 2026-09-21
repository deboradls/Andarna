import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBookProgressAndRating1730000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user_books" ADD "progress" smallint NOT NULL DEFAULT 0');
    await queryRunner.query('ALTER TABLE "user_books" ADD "rating" smallint NOT NULL DEFAULT 0');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user_books" DROP COLUMN "rating"');
    await queryRunner.query('ALTER TABLE "user_books" DROP COLUMN "progress"');
  }
}
