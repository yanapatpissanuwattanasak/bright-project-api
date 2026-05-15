import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProjectsTable1746000000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`)

    await queryRunner.query(`
      CREATE TABLE projects (
        id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
        title           VARCHAR(120) NOT NULL,
        slug            VARCHAR(120) NOT NULL UNIQUE,
        summary         VARCHAR(280) NOT NULL,
        problem         TEXT,
        solution        TEXT,
        tech_stack      TEXT[]       NOT NULL DEFAULT '{}',
        metrics         JSONB,
        loom_url        VARCHAR(512),
        demo_url        VARCHAR(512),
        github_url      VARCHAR(512),
        thumbnail_url   VARCHAR(512),
        sort_order      INTEGER      NOT NULL DEFAULT 0,
        is_featured     BOOLEAN      NOT NULL DEFAULT false,
        status          VARCHAR(20)  NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'published', 'archived')),
        published_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `)

    await queryRunner.query(`CREATE INDEX idx_projects_status_sort ON projects (status, sort_order)`)
    await queryRunner.query(`CREATE INDEX idx_projects_slug ON projects (slug)`)
    await queryRunner.query(`CREATE INDEX idx_projects_featured ON projects (is_featured) WHERE is_featured = true`)

    await queryRunner.query(`
      ALTER TABLE projects ADD COLUMN search_vector TSVECTOR
        GENERATED ALWAYS AS (
          to_tsvector('english',
            coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(problem,''))
        ) STORED
    `)
    await queryRunner.query(`CREATE INDEX idx_projects_search ON projects USING GIN (search_vector)`)

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql
    `)
    await queryRunner.query(`
      CREATE TRIGGER trg_projects_updated_at
        BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS projects`)
  }
}
