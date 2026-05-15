import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateRpsRoomsTable1746000000005 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNLOGGED TABLE rps_rooms (
        room_code   CHAR(6)      PRIMARY KEY,
        phase       VARCHAR(12)  NOT NULL DEFAULT 'lobby'
                                   CHECK (phase IN ('lobby','hero-select','battle','gameover')),
        players     JSONB        NOT NULL DEFAULT '[]',
        expires_at  TIMESTAMPTZ  NOT NULL,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `)

    await queryRunner.query(
      `CREATE INDEX idx_rps_rooms_expires ON rps_rooms (expires_at)`,
    )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS rps_rooms`)
  }
}
