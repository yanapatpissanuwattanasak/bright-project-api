import { GameSession } from './game-session.entity'

export type RoomPhase = 'lobby' | 'playing' | 'gameover'

export interface OnlinePlayer {
  sessionId: string
  socketId: string
  deckId: string | null
  connected: boolean
}

export interface PokemonGameRoom {
  roomCode: string
  phase: RoomPhase
  players: OnlinePlayer[]
  gameState: GameSession | null
  expiresAt: Date
  createdAt: Date
}
