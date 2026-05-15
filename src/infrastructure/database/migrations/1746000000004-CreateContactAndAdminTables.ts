import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateContactAndAdminTables1746000000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE contact_messages (
        id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
        name         VARCHAR(120) NOT NULL,
        email        VARCHAR(254) NOT NULL,
        message      TEXT         NOT NULL,
        project_type VARCHAR(60),
        is_read      BOOLEAN      NOT NULL DEFAULT false,
        ip_address   INET,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_contact_created ON contact_messages (created_at DESC)`)
    await queryRunner.query(`CREATE INDEX idx_contact_unread  ON contact_messages (is_read) WHERE is_read = false`)

    await queryRunner.query(`
      CREATE TABLE admin_users (
        id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
        email         VARCHAR(254) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        last_login_at TIMESTAMPTZ,
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS admin_users`)
    await queryRunner.query(`DROP TABLE IF EXISTS contact_messages`)
  }
}
