import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReadingUpdates1750000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "reading_updates" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_book_id" uuid NOT NULL REFERENCES "user_books"("id") ON DELETE CASCADE,
      "mode" varchar(12) NOT NULL CHECK ("mode" IN ('percentage', 'pages')),
      "value" integer NOT NULL CHECK ("value" >= 0),
      "progress" smallint NOT NULL CHECK ("progress" BETWEEN 0 AND 100),
      "read_date" date NOT NULL,
      "description" text,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    )`);
    await queryRunner.query('CREATE INDEX "IDX_reading_updates_book_date" ON "reading_updates" ("user_book_id", "read_date" DESC, "created_at" DESC)');
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "reading_updates"');
  }
}
