export type Choice = 'rock' | 'paper' | 'scissors'
export type Phase = 'lobby' | 'hero-select' | 'battle' | 'gameover'

export interface PlayerState {
  sessionId: string
  socketId: string
  heroId: string | null
  hp: number
  choice: Choice | null
  connected: boolean
}

export interface RoomState {
  roomCode: string
  phase: Phase
  players: PlayerState[]
  expiresAt: Date
  createdAt: Date
}
