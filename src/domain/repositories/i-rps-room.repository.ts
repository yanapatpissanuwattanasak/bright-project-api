import { PlayerState, RoomState } from '../entities/rps-room.entity'

export const I_RPS_ROOM_REPOSITORY = Symbol('IRpsRoomRepository')

export interface IRpsRoomRepository {
  create(roomCode: string, player: PlayerState): Promise<RoomState>
  findByCode(roomCode: string): Promise<RoomState | null>
  findBySocketId(socketId: string): Promise<RoomState | null>
  save(room: RoomState): Promise<void>
  delete(roomCode: string): Promise<void>
  deleteExpired(): Promise<number>
}
