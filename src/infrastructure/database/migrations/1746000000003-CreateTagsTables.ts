import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTagsTables1746000000003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tags (
        id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
        name       VARCHAR(60) NOT NULL UNIQUE,
        slug       VARCHAR(60) NOT NULL UNIQUE,
        color      VARCHAR(7),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await queryRunner.query(`
      CREATE TABLE project_tags (
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        tag_id     UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (project_id, tag_id)
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_project_tags_tag ON project_tags (tag_id)`)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS project_tags`)
    await queryRunner.query(`DROP TABLE IF EXISTS tags`)
  }
}
