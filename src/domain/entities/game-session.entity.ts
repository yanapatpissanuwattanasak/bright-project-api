import { PokemonPlayerState } from '@domain/value-objects/player-state.vo'

export type GamePhase = 'playing' | 'waiting-promote' | 'ended'
export type GameMode = 'vs-ai-easy' | 'vs-ai-hard'

export interface GameSession {
  sessionId: string
  mode: GameMode
  phase: GamePhase
  currentPlayerIndex: 0 | 1
  promotingPlayerIndex: 0 | 1 | null
  players: [PokemonPlayerState, PokemonPlayerState]
  turnCount: number
  actionLog: string[]
  winner: number | null
  winReason: string | null
  expiresAt: Date
  createdAt: Date
}
