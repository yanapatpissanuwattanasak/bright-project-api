import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { PokemonGameRoom } from '@domain/entities/pokemon-game-room.entity'
import { GameSession } from '@domain/entities/game-session.entity'
import { I_POKEMON_GAME_ROOM_REPOSITORY, IPokemonGameRoomRepository } from '@domain/repositories/i-pokemon-game-room.repository'
import { GameEngineService } from '@domain/services/game-engine.service'
import { ALL_PRESET_DECKS } from '../../../data/preset-decks.data'

export interface JoinGameRoomInput {
  roomCode: string
  sessionId: string
  socketId: string
  deckId: string
}

export interface JoinGameRoomResult {
  room: PokemonGameRoom
  isReconnect: boolean
  gameStarted: boolean
}

@Injectable()
export class JoinGameRoomUseCase {
  constructor(
    @Inject(I_POKEMON_GAME_ROOM_REPOSITORY) private readonly roomRepo: IPokemonGameRoomRepository,
    private readonly engine: GameEngineService,
  ) {}

  async execute(input: JoinGameRoomInput): Promise<JoinGameRoomResult> {
    const room = await this.roomRepo.findByCode(input.roomCode)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (room.phase === 'gameover') throw new Error('ROOM_CLOSED')

    const existing = room.players.find(p => p.sessionId === input.sessionId)
    if (existing) {
      existing.socketId = input.socketId
      existing.connected = true
      await this.roomRepo.save(room)
      return { room, isReconnect: true, gameStarted: false }
    }

    if (room.players.length >= 2) throw new Error('ROOM_FULL')

    room.players.push({
      sessionId: input.sessionId,
      socketId: input.socketId,
      deckId: input.deckId,
      connected: true,
    })

    let gameStarted = false
    if (room.players.length === 2) {
      room.phase = 'playing'
      room.gameState = this.initGame(room)
      gameStarted = true
    }

    await this.roomRepo.save(room)
    return { room, isReconnect: false, gameStarted }
  }

  private initGame(room: PokemonGameRoom): GameSession {
    const [p0, p1] = room.players
    const deck0Preset = ALL_PRESET_DECKS.find((d: { id: string }) => d.id === p0.deckId) ?? ALL_PRESET_DECKS[0]
    const deck1Preset = ALL_PRESET_DECKS.find((d: { id: string }) => d.id === p1.deckId) ?? ALL_PRESET_DECKS[0]

    return this.engine.initializeGame(
      randomUUID(),
      'vs-ai-easy',  // mode field repurposed — online sessions always use full engine
      this.engine.buildDeck(deck0Preset),
      this.engine.buildDeck(deck1Preset),
    )
  }
}
