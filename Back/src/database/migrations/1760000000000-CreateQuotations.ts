import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuotations1760000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "quotations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_book_id" uuid NOT NULL REFERENCES "user_books"("id") ON DELETE CASCADE,
      "text" text NOT NULL CHECK (length(trim("text")) BETWEEN 1 AND 5000),
      "page" integer CHECK ("page" > 0),
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    )`);
    await queryRunner.query('CREATE INDEX "IDX_quotations_user_book" ON "quotations" ("user_book_id")');
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "quotations"');
  }
}
