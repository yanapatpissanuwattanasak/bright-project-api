import { Injectable } from '@nestjs/common'
import { Card, EnergyCard, GameAction, PokemonCard, PokemonType, TrainerCard } from '@domain/entities/pokemon-card.entity'
import { GameMode, GamePhase, GameSession } from '@domain/entities/game-session.entity'
import { BoardPokemon } from '@domain/value-objects/board-pokemon.vo'
import { PokemonPlayerState } from '@domain/value-objects/player-state.vo'
import { CARD_REGISTRY } from '../../data/pokemon-cards.data'
import { PresetDeck } from '../../data/preset-decks.data'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(array: T[]): T[] {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function clonePlayer(p: PokemonPlayerState): PokemonPlayerState {
  return {
    ...p,
    hand: [...p.hand],
    deck: [...p.deck],
    discardPile: [...p.discardPile],
    prizeCards: [...p.prizeCards],
    activePokemon: p.activePokemon
      ? { ...p.activePokemon, attachedEnergy: [...p.activePokemon.attachedEnergy] }
      : null,
    bench: p.bench.map(b =>
      b ? { ...b, attachedEnergy: [...b.attachedEnergy] } : null,
    ),
  }
}

function cloneSession(s: GameSession): GameSession {
  return {
    ...s,
    players: [clonePlayer(s.players[0]), clonePlayer(s.players[1])],
    actionLog: [...s.actionLog],
  }
}

function log(session: GameSession, msg: string): void {
  session.actionLog.push(msg)
}

@Injectable()
export class GameEngineService {
  // ─── Build & Initialize ───────────────────────────────────────────────────

  buildDeck(preset: PresetDeck): Card[] {
    const cards: Card[] = []
    for (const entry of preset.cards) {
      const template = CARD_REGISTRY.get(entry.cardId)
      if (!template) throw new Error(`Unknown card id: ${entry.cardId}`)
      for (let i = 0; i < entry.quantity; i++) {
        cards.push({ ...template })
      }
    }
    return cards
  }

  initializeGame(
    sessionId: string,
    mode: GameMode,
    deck0: Card[],
    deck1: Card[],
  ): GameSession {
    const p0 = this.dealInitialHand(shuffle(deck0), 'player-0')
    const p1 = this.dealInitialHand(shuffle(deck1), 'player-1')

    const session: GameSession = {
      sessionId,
      mode,
      phase: 'playing' as GamePhase,
      currentPlayerIndex: 0,
      promotingPlayerIndex: null,
      players: [p0, p1],
      turnCount: 0,
      actionLog: [],
      winner: null,
      winReason: null,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      createdAt: new Date(),
    }

    log(session, 'Game started. Player 0 goes first.')
    return session
  }

  private dealInitialHand(deck: Card[], playerId: string): PokemonPlayerState {
    let hand: Card[] = []
    let remaining = [...deck]
    let mulligans = 0

    do {
      hand = remaining.splice(0, 7)
      if (!hand.some(c => c.cardType === 'pokemon' && (c as PokemonCard).stage === 'basic')) {
        remaining = shuffle([...remaining, ...hand])
        mulligans++
      } else {
        break
      }
    } while (mulligans < 10)

    const prizeCards = remaining.splice(0, 6)

    return {
      playerId,
      hand,
      deck: remaining,
      discardPile: [],
      prizeCards,
      activePokemon: null,
      bench: [null, null, null, null, null],
      hasAttachedEnergy: false,
      hasUsedSupporter: false,
      hasAttacked: false,
      hasRetreated: false,
    }
  }

  // ─── Turn Management ──────────────────────────────────────────────────────

  startTurn(session: GameSession): GameSession {
    const s = cloneSession(session)
    const idx = s.currentPlayerIndex
    const p = s.players[idx]

    // increment turnsOnField for all Pokemon of the newly active player
    if (p.activePokemon) p.activePokemon.turnsOnField++
    p.bench.forEach(b => { if (b) b.turnsOnField++ })

    // reset per-turn flags
    p.hasAttachedEnergy = false
    p.hasUsedSupporter = false
    p.hasAttacked = false
    p.hasRetreated = false

    // draw 1 card (skip the very first turn)
    if (s.turnCount > 0 || idx === 1) {
      if (p.deck.length === 0) {
        s.phase = 'ended'
        s.winner = idx === 0 ? 1 : 0
        s.winReason = `Player ${idx} could not draw a card (empty deck).`
        log(s, s.winReason)
        return s
      }
      const drawn = p.deck.shift()!
      p.hand.push(drawn)
      log(s, `Player ${idx} draws a card. (hand: ${p.hand.length}, deck: ${p.deck.length})`)
    }

    s.turnCount++
    return s
  }

  private switchTurn(session: GameSession): GameSession {
    const s = cloneSession(session)
    s.currentPlayerIndex = s.currentPlayerIndex === 0 ? 1 : 0
    return this.startTurn(s)
  }

  // ─── Damage & Win ─────────────────────────────────────────────────────────

  private hasEnoughEnergy(cost: PokemonType[], attached: EnergyCard[]): boolean {
    const pool: Record<string, number> = {}
    for (const e of attached) pool[e.energyType] = (pool[e.energyType] ?? 0) + 1

    for (const req of cost) {
      if (req !== 'colorless') {
        if (!pool[req]) return false
        pool[req]--
      }
    }
    const colorlessNeeded = cost.filter(r => r === 'colorless').length
    const remaining = Object.values(pool).reduce((a, b) => a + b, 0)
    return remaining >= colorlessNeeded
  }

  private calculateDamage(
    attack: { damage: number; energyCost: PokemonType[] },
    attackerType: PokemonType,
    defender: BoardPokemon,
  ): number {
    let dmg = attack.damage

    if (defender.card.weakness?.type === attackerType) {
      dmg *= defender.card.weakness.multiplier
    }
    if (defender.card.resistance?.type === attackerType) {
      dmg -= defender.card.resistance.reduction
    }

    return Math.max(0, dmg)
  }

  private checkWinCondition(session: GameSession): GameSession {
    const s = cloneSession(session)

    for (let i = 0; i < 2; i++) {
      const p = s.players[i]
      if (p.prizeCards.length === 0) {
        s.phase = 'ended'
        s.winner = i
        s.winReason = `Player ${i} collected all 6 Prize Cards!`
        log(s, s.winReason)
        return s
      }
    }

    for (let i = 0; i < 2; i++) {
      const p = s.players[i]
      const hasActive = p.activePokemon !== null
      const hasBench = p.bench.some(b => b !== null)
      if (!hasActive && !hasBench) {
        const winner = i === 0 ? 1 : 0
        s.phase = 'ended'
        s.winner = winner
        s.winReason = `Player ${i} has no Pokémon left!`
        log(s, s.winReason)
        return s
      }
    }

    return s
  }

  private resolveKo(session: GameSession, koPlayerIndex: number): GameSession {
    let s = cloneSession(session)
    const attacker = s.players[koPlayerIndex === 0 ? 1 : 0]
    const koPlayer = s.players[koPlayerIndex]

    // ko'd pokemon + its energy go to discard
    if (koPlayer.activePokemon) {
      for (const e of koPlayer.activePokemon.attachedEnergy) {
        koPlayer.discardPile.push(e)
      }
      koPlayer.discardPile.push(koPlayer.activePokemon.card)
      log(s, `${koPlayer.activePokemon.card.name} is KO'd!`)
      koPlayer.activePokemon = null
    }

    // attacker takes 1 prize card
    if (attacker.prizeCards.length > 0) {
      const prize = attacker.prizeCards.pop()!
      attacker.hand.push(prize)
      log(s, `Player ${koPlayerIndex === 0 ? 1 : 0} takes a Prize Card. (${attacker.prizeCards.length} remaining)`)
    }

    s = this.checkWinCondition(s)
    if (s.phase === 'ended') return s

    // if KO'd player has bench, they must promote
    if (koPlayer.bench.some(b => b !== null)) {
      s.phase = 'waiting-promote'
      s.promotingPlayerIndex = koPlayerIndex as 0 | 1
      log(s, `Player ${koPlayerIndex} must choose a Bench Pokémon to promote.`)
    } else {
      const winner = koPlayerIndex === 0 ? 1 : 0
      s.phase = 'ended'
      s.winner = winner
      s.winReason = `Player ${koPlayerIndex} has no Pokémon on the Bench!`
      log(s, s.winReason)
    }

    return s
  }

  // ─── Action Processing ────────────────────────────────────────────────────

  applyAction(session: GameSession, playerIndex: number, action: GameAction): { session: GameSession; error?: string } {
    if (session.phase === 'ended') return { session, error: 'Game is already over.' }

    if (session.phase === 'waiting-promote') {
      if (action.type !== 'PROMOTE_POKEMON') return { session, error: 'Must promote a Pokémon first.' }
      if (playerIndex !== session.promotingPlayerIndex) return { session, error: 'Not your turn to promote.' }
    } else if (playerIndex !== session.currentPlayerIndex) {
      return { session, error: 'Not your turn.' }
    }

    const s = cloneSession(session)
    const p = s.players[playerIndex]

    switch (action.type) {
      case 'PLAY_POKEMON': {
        const { handIndex } = action
        if (handIndex === undefined) return { session, error: 'handIndex required.' }
        const card = p.hand[handIndex]
        if (!card || card.cardType !== 'pokemon') return { session, error: 'Not a Pokémon card.' }
        const pkmn = card as PokemonCard
        if (pkmn.stage !== 'basic') return { session, error: 'Can only play Basic Pokémon directly.' }

        // place on active if no active, otherwise bench
        if (!p.activePokemon) {
          p.activePokemon = { card: pkmn, currentHp: pkmn.hp, attachedEnergy: [], turnsOnField: 0 }
          p.hand.splice(handIndex, 1)
          log(s, `Player ${playerIndex} places ${pkmn.name} as Active.`)
        } else {
          const slot = p.bench.findIndex(b => b === null)
          if (slot === -1) return { session, error: 'Bench is full.' }
          p.bench[slot] = { card: pkmn, currentHp: pkmn.hp, attachedEnergy: [], turnsOnField: 0 }
          p.hand.splice(handIndex, 1)
          log(s, `Player ${playerIndex} places ${pkmn.name} on Bench slot ${slot}.`)
        }
        break
      }

      case 'ATTACH_ENERGY': {
        if (p.hasAttachedEnergy) return { session, error: 'Already attached Energy this turn.' }
        const { handIndex, targetSlot } = action
        if (handIndex === undefined || targetSlot === undefined) return { session, error: 'handIndex and targetSlot required.' }
        const card = p.hand[handIndex]
        if (!card || card.cardType !== 'energy') return { session, error: 'Not an Energy card.' }
        const energy = card as EnergyCard

        let target: BoardPokemon | null = null
        if (targetSlot === 'active') {
          target = p.activePokemon
        } else if (typeof targetSlot === 'number' && targetSlot >= 0 && targetSlot < 5) {
          target = p.bench[targetSlot]
        }
        if (!target) return { session, error: 'No Pokémon in target slot.' }

        target.attachedEnergy.push(energy)
        p.hand.splice(handIndex, 1)
        p.hasAttachedEnergy = true
        log(s, `Player ${playerIndex} attaches ${energy.name} to ${target.card.name}.`)
        break
      }

      case 'ATTACK': {
        if (p.hasAttacked) return { session, error: 'Already attacked this turn.' }
        if (!p.activePokemon) return { session, error: 'No Active Pokémon.' }
        const opponent = s.players[playerIndex === 0 ? 1 : 0]
        if (!opponent.activePokemon) return { session, error: 'Opponent has no Active Pokémon.' }

        const { attackIndex = 0 } = action
        const attack = p.activePokemon.card.attacks[attackIndex]
        if (!attack) return { session, error: 'Invalid attack index.' }
        if (!this.hasEnoughEnergy(attack.energyCost, p.activePokemon.attachedEnergy)) {
          return { session, error: 'Not enough Energy for this attack.' }
        }

        const dmg = this.calculateDamage(attack, p.activePokemon.card.pokemonType, opponent.activePokemon)
        opponent.activePokemon.currentHp -= dmg
        p.hasAttacked = true
        log(s, `${p.activePokemon.card.name} uses ${attack.name} for ${dmg} damage! (${opponent.activePokemon.card.name} HP: ${opponent.activePokemon.currentHp}/${opponent.activePokemon.card.hp})`)

        if (opponent.activePokemon.currentHp <= 0) {
          const oppIdx = playerIndex === 0 ? 1 : 0
          let resolved = this.resolveKo(s, oppIdx)
          if (resolved.phase === 'ended') return { session: resolved }
          if (resolved.phase === 'waiting-promote') return { session: resolved }
          resolved = this.switchTurn(resolved)
          return { session: resolved }
        }

        return { session: this.switchTurn(s) }
      }

      case 'RETREAT': {
        if (p.hasRetreated) return { session, error: 'Already retreated this turn.' }
        if (!p.activePokemon) return { session, error: 'No Active Pokémon.' }
        const { benchIndex } = action
        if (benchIndex === undefined) return { session, error: 'benchIndex required.' }
        const benchTarget = p.bench[benchIndex]
        if (!benchTarget) return { session, error: 'No Pokémon in that Bench slot.' }

        const cost = p.activePokemon.card.retreatCost
        if (p.activePokemon.attachedEnergy.length < cost) {
          return { session, error: `Need ${cost} Energy to retreat.` }
        }

        // discard retreatCost energies
        const discarded = p.activePokemon.attachedEnergy.splice(0, cost)
        discarded.forEach(e => p.discardPile.push(e))

        const old = p.activePokemon
        p.activePokemon = benchTarget
        p.bench[benchIndex] = old
        p.hasRetreated = true
        log(s, `Player ${playerIndex} retreats ${old.card.name}, ${benchTarget.card.name} becomes Active.`)
        break
      }

      case 'PLAY_TRAINER': {
        const { handIndex, trainerTarget, benchIndex } = action
        if (handIndex === undefined) return { session, error: 'handIndex required.' }
        const card = p.hand[handIndex]
        if (!card || card.cardType !== 'trainer') return { session, error: 'Not a Trainer card.' }
        const trainer = card as TrainerCard

        if (trainer.trainerSubtype === 'supporter' && p.hasUsedSupporter) {
          return { session, error: 'Already used a Supporter this turn.' }
        }

        const result = this.applyTrainerEffect(s, playerIndex, trainer, { trainerTarget, benchIndex })
        if (result.error) return { session, error: result.error }

        p.hand.splice(handIndex, 1)
        p.discardPile.push(trainer)
        if (trainer.trainerSubtype === 'supporter') p.hasUsedSupporter = true
        log(s, `Player ${playerIndex} plays ${trainer.name}.`)
        break
      }

      case 'PROMOTE_POKEMON': {
        const { benchIndex } = action
        if (benchIndex === undefined) return { session, error: 'benchIndex required.' }
        const benchTarget = p.bench[benchIndex]
        if (!benchTarget) return { session, error: 'No Pokémon in that Bench slot.' }
        if (p.activePokemon) return { session, error: 'Already has an Active Pokémon.' }

        p.activePokemon = benchTarget
        p.bench[benchIndex] = null
        log(s, `Player ${playerIndex} promotes ${benchTarget.card.name} to Active.`)

        s.phase = 'playing'
        s.promotingPlayerIndex = null
        // after promotion, switch to opponent's turn
        return { session: this.switchTurn(s) }
      }

      case 'EVOLVE': {
        const { handIndex, targetSlot } = action
        if (handIndex === undefined || targetSlot === undefined) return { session, error: 'handIndex and targetSlot required.' }
        const card = p.hand[handIndex]
        if (!card || card.cardType !== 'pokemon') return { session, error: 'Not a Pokémon card.' }
        const evolution = card as PokemonCard
        if (!evolution.evolvesFrom) return { session, error: 'Not an evolution card.' }

        let target: BoardPokemon | null = null
        if (targetSlot === 'active') {
          target = p.activePokemon
        } else if (typeof targetSlot === 'number') {
          target = p.bench[targetSlot]
        }
        if (!target) return { session, error: 'No Pokémon in target slot.' }
        if (target.card.name !== evolution.evolvesFrom) return { session, error: `${evolution.name} evolves from ${evolution.evolvesFrom}.` }
        if (target.turnsOnField < 1) return { session, error: 'Pokémon must have been in play for at least 1 turn to evolve.' }

        const damageTaken = target.card.hp - target.currentHp
        target.card = evolution
        target.currentHp = Math.max(1, evolution.hp - damageTaken)
        p.hand.splice(handIndex, 1)
        log(s, `Player ${playerIndex} evolves ${evolution.evolvesFrom} into ${evolution.name}!`)
        break
      }

      case 'END_TURN': {
        log(s, `Player ${playerIndex} ends their turn.`)
        return { session: this.switchTurn(s) }
      }
    }

    return { session: s }
  }

  // ─── Trainer Effects ──────────────────────────────────────────────────────

  private applyTrainerEffect(
    session: GameSession,
    playerIndex: number,
    trainer: TrainerCard,
    opts: { trainerTarget?: 'active' | number; benchIndex?: number },
  ): { error?: string } {
    const p = session.players[playerIndex]

    const getTarget = (): BoardPokemon | null => {
      if (opts.trainerTarget === 'active') return p.activePokemon
      if (typeof opts.trainerTarget === 'number') return p.bench[opts.trainerTarget]
      return p.activePokemon
    }

    switch (trainer.effect) {
      case 'HEAL_30': {
        const target = getTarget()
        if (!target) return { error: 'No target Pokémon.' }
        target.currentHp = Math.min(target.card.hp, target.currentHp + 30)
        return {}
      }
      case 'HEAL_60_DISCARD_ENERGY': {
        const target = getTarget()
        if (!target) return { error: 'No target Pokémon.' }
        if (target.attachedEnergy.length === 0) return { error: 'No Energy to discard.' }
        const e = target.attachedEnergy.pop()!
        p.discardPile.push(e)
        target.currentHp = Math.min(target.card.hp, target.currentHp + 60)
        return {}
      }
      case 'FULL_HEAL': {
        return {}
      }
      case 'SWITCH': {
        if (!p.activePokemon) return { error: 'No Active Pokémon.' }
        const slot = typeof opts.benchIndex === 'number' ? opts.benchIndex : p.bench.findIndex(b => b !== null)
        if (slot === -1 || !p.bench[slot]) return { error: 'No Bench Pokémon to switch with.' }
        const old = p.activePokemon
        p.activePokemon = p.bench[slot]!
        p.bench[slot] = old
        return {}
      }
      case 'RETRIEVE_2_ENERGY': {
        const energies = p.discardPile.filter(c => c.cardType === 'energy') as EnergyCard[]
        const picked = energies.slice(0, 2)
        picked.forEach(e => {
          const idx = p.discardPile.indexOf(e)
          p.discardPile.splice(idx, 1)
          p.hand.push(e)
        })
        return {}
      }
      case 'SEARCH_BASIC_ENERGY': {
        const idx = p.deck.findIndex(c => c.cardType === 'energy')
        if (idx !== -1) {
          const [e] = p.deck.splice(idx, 1)
          p.hand.push(e)
          p.deck = shuffle(p.deck)
        }
        return {}
      }
      case 'SEARCH_TOP_7_POKEMON': {
        const top7 = p.deck.slice(0, 7)
        const pkmnIdx = top7.findIndex(c => c.cardType === 'pokemon')
        if (pkmnIdx !== -1) {
          const [pkmn] = p.deck.splice(pkmnIdx, 1)
          p.hand.push(pkmn)
          p.deck = shuffle(p.deck)
        }
        return {}
      }
      case 'SEARCH_POKEMON_IN_DECK': {
        const handPkmnIdx = p.hand.findIndex(c => c.cardType === 'pokemon')
        if (handPkmnIdx === -1) return { error: 'No Pokémon in hand to trade.' }
        const [fromHand] = p.hand.splice(handPkmnIdx, 1)
        p.deck.push(fromHand)
        p.deck = shuffle(p.deck)
        const deckPkmnIdx = p.deck.findIndex(c => c.cardType === 'pokemon')
        if (deckPkmnIdx !== -1) {
          const [found] = p.deck.splice(deckPkmnIdx, 1)
          p.hand.push(found)
          p.deck = shuffle(p.deck)
        }
        return {}
      }
      case 'DRAW_7_DISCARD_HAND': {
        p.discardPile.push(...p.hand)
        p.hand = []
        const drawn = p.deck.splice(0, 7)
        p.hand = drawn
        return {}
      }
      case 'MARNIE_SHUFFLE': {
        const opp = session.players[playerIndex === 0 ? 1 : 0]
        p.deck.push(...p.hand)
        p.deck = shuffle(p.deck)
        p.hand = p.deck.splice(0, 5)

        opp.deck.push(...opp.hand)
        opp.deck = shuffle(opp.deck)
        opp.hand = opp.deck.splice(0, 4)
        return {}
      }
      case 'DRAW_2': {
        const drawn = p.deck.splice(0, 2)
        p.hand.push(...drawn)
        return {}
      }
      case 'SEARCH_BASIC_POKEMON': {
        const idx = p.deck.findIndex(c => c.cardType === 'pokemon' && (c as PokemonCard).stage === 'basic')
        if (idx !== -1) {
          const [pkmn] = p.deck.splice(idx, 1)
          const slot = p.bench.findIndex(b => b === null)
          if (slot !== -1 && !p.activePokemon) {
            p.activePokemon = { card: pkmn as PokemonCard, currentHp: (pkmn as PokemonCard).hp, attachedEnergy: [], turnsOnField: 0 }
          } else if (slot !== -1) {
            p.bench[slot] = { card: pkmn as PokemonCard, currentHp: (pkmn as PokemonCard).hp, attachedEnergy: [], turnsOnField: 0 }
          } else {
            p.hand.push(pkmn)
          }
          p.deck = shuffle(p.deck)
        }
        return {}
      }
    }
  }

  // ─── AI Logic ─────────────────────────────────────────────────────────────

  runAiTurn(session: GameSession, aiPlayerIndex: number, difficulty: 'easy' | 'hard'): GameSession {
    let s = cloneSession(session)
    const p = s.players[aiPlayerIndex]

    // 1. Play Basic Pokemon to bench / active
    for (let i = p.hand.length - 1; i >= 0; i--) {
      const card = p.hand[i]
      if (card.cardType !== 'pokemon') continue
      const pkmn = card as PokemonCard
      if (pkmn.stage !== 'basic') continue
      if (!p.activePokemon || p.bench.some(b => b === null)) {
        const result = this.applyAction(s, aiPlayerIndex, { type: 'PLAY_POKEMON', handIndex: i })
        if (!result.error) s = result.session
      }
    }

    // 2. Attach energy to active (or to bench Pokemon with most energy if hard)
    const energyIdx = p.hand.findIndex(c => c.cardType === 'energy')
    if (energyIdx !== -1 && !s.players[aiPlayerIndex].hasAttachedEnergy) {
      let targetSlot: 'active' | number = 'active'
      if (difficulty === 'hard' && !s.players[aiPlayerIndex].activePokemon) {
        const benchSlot = s.players[aiPlayerIndex].bench.findIndex(b => b !== null)
        if (benchSlot !== -1) targetSlot = benchSlot
      }
      const result = this.applyAction(s, aiPlayerIndex, { type: 'ATTACH_ENERGY', handIndex: energyIdx, targetSlot })
      if (!result.error) s = result.session
    }

    // 3. Try to attack
    const aiPlayer = s.players[aiPlayerIndex]
    if (aiPlayer.activePokemon && !aiPlayer.hasAttacked) {
      const opponent = s.players[aiPlayerIndex === 0 ? 1 : 0]
      const attacks = aiPlayer.activePokemon.card.attacks

      let bestAttackIdx = -1
      let bestDamage = -1

      for (let i = 0; i < attacks.length; i++) {
        if (!this.hasEnoughEnergy(attacks[i].energyCost, aiPlayer.activePokemon.attachedEnergy)) continue
        let dmg = attacks[i].damage

        if (difficulty === 'hard' && opponent.activePokemon) {
          dmg = this.calculateDamage(attacks[i], aiPlayer.activePokemon.card.pokemonType, opponent.activePokemon)
        }

        if (dmg > bestDamage) {
          bestDamage = dmg
          bestAttackIdx = i
        }
      }

      if (bestAttackIdx !== -1) {
        const result = this.applyAction(s, aiPlayerIndex, { type: 'ATTACK', attackIndex: bestAttackIdx })
        if (!result.error) return result.session
      }
    }

    // 4. End turn
    const result = this.applyAction(s, aiPlayerIndex, { type: 'END_TURN' })
    return result.error ? s : result.session
  }
}
