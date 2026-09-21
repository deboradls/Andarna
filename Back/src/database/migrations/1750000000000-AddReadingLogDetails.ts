import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReadingLogDetails1750000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "books" ADD "page_count" integer');
    await queryRunner.query('ALTER TABLE "user_books" ADD "reading_mode" varchar(12), ADD "reading_value" integer, ADD "last_read_at" date, ADD "reading_note" text');
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user_books" DROP COLUMN "reading_note", DROP COLUMN "last_read_at", DROP COLUMN "reading_value", DROP COLUMN "reading_mode"');
    await queryRunner.query('ALTER TABLE "books" DROP COLUMN "page_count"');
  }
}
