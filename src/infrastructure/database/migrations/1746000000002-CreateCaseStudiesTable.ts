import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCaseStudiesTable1746000000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE case_studies (
        id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id             UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        architecture_decisions JSONB NOT NULL DEFAULT '[]',
        content                JSONB NOT NULL DEFAULT '[]',
        created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (project_id)
      )
    `)
    await queryRunner.query(`
      CREATE TRIGGER trg_case_studies_updated_at
        BEFORE UPDATE ON case_studies FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS case_studies`)
  }
}
