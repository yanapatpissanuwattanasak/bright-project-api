import { Column, Entity, PrimaryColumn } from 'typeorm'
import { Phase, PlayerState } from '@domain/entities/rps-room.entity'

@Entity('rps_rooms')
export class RpsRoomOrmEntity {
  @PrimaryColumn({ name: 'room_code', type: 'char', length: 6 })
  roomCode: string

  @Column({ type: 'varchar', length: 12 })
  phase: Phase

  @Column({ type: 'jsonb' })
  players: PlayerState[]

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date
}
