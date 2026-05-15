import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IRpsRoomRepository } from '@domain/repositories/i-rps-room.repository'
import { PlayerState, RoomState } from '@domain/entities/rps-room.entity'
import { RpsRoomOrmEntity } from '../orm-entities/rps-room.orm-entity'

@Injectable()
export class RpsRoomTypeormRepository implements IRpsRoomRepository {
  constructor(
    @InjectRepository(RpsRoomOrmEntity)
    private readonly repo: Repository<RpsRoomOrmEntity>,
  ) {}

  async create(roomCode: string, player: PlayerState): Promise<RoomState> {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    const orm = this.repo.create({
      roomCode,
      phase: 'lobby',
      players: [player],
      expiresAt,
      createdAt: new Date(),
    })
    await this.repo.save(orm)
    return this.toDomain(orm)
  }

  async findByCode(roomCode: string): Promise<RoomState | null> {
    const orm = await this.repo.findOne({ where: { roomCode } })
    return orm ? this.toDomain(orm) : null
  }

  async findBySocketId(socketId: string): Promise<RoomState | null> {
    const orm = await this.repo
      .createQueryBuilder('r')
      .where(`r.players @> :filter::jsonb`, {
        filter: JSON.stringify([{ socketId }]),
      })
      .getOne()
    return orm ? this.toDomain(orm) : null
  }

  async save(room: RoomState): Promise<void> {
    await this.repo.save({
      roomCode: room.roomCode,
      phase: room.phase,
      players: room.players,
      expiresAt: room.expiresAt,
      createdAt: room.createdAt,
    })
  }

  async delete(roomCode: string): Promise<void> {
    await this.repo.delete({ roomCode })
  }

  async deleteExpired(): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .from(RpsRoomOrmEntity)
      .where('expires_at < NOW()')
      .execute()
    return result.affected ?? 0
  }

  private toDomain(orm: RpsRoomOrmEntity): RoomState {
    return {
      roomCode: orm.roomCode,
      phase: orm.phase,
      players: orm.players,
      expiresAt: orm.expiresAt,
      createdAt: orm.createdAt,
    }
  }
}
