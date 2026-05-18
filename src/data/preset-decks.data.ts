export interface DeckEntry {
  cardId: string
  quantity: number
}

export interface PresetDeck {
  id: string
  name: string
  description: string
  primaryType: string
  cards: DeckEntry[]
}

// ─── Original Starter Decks (rebalanced) ──────────────────────────────────────

export const FIRE_STARTER_DECK: PresetDeck = {
  id: 'deck-fire-starter',
  name: 'Fire Starter',
  description: 'A blazing deck built around the Charmander line. Overwhelm your opponent with powerful Fire attacks.',
  primaryType: 'fire',
  cards: [
    { cardId: 'pkmn-004-charmander', quantity: 4 },
    { cardId: 'pkmn-005-charmeleon', quantity: 3 },
    { cardId: 'pkmn-006-charizard', quantity: 2 },
    { cardId: 'pkmn-058-growlithe', quantity: 3 },
    { cardId: 'pkmn-059-arcanine', quantity: 2 },
    { cardId: 'pkmn-077-ponyta', quantity: 2 },
    { cardId: 'trainer-potion', quantity: 3 },
    { cardId: 'trainer-super-potion', quantity: 2 },
    { cardId: 'trainer-switch', quantity: 2 },
    { cardId: 'trainer-nest-ball', quantity: 2 },
    { cardId: 'trainer-great-ball', quantity: 2 },
    { cardId: 'trainer-bills-training', quantity: 2 },
    { cardId: 'trainer-energy-retrieval', quantity: 2 },
    { cardId: 'trainer-professors-research', quantity: 2 },
    { cardId: 'trainer-marnie', quantity: 1 },
    { cardId: 'energy-fire', quantity: 22 },
  ],
}

export const WATER_STARTER_DECK: PresetDeck = {
  id: 'deck-water-starter',
  name: 'Water Starter',
  description: 'A steady deck built around the Squirtle line. Control the field and outlast your opponent.',
  primaryType: 'water',
  cards: [
    { cardId: 'pkmn-007-squirtle', quantity: 4 },
    { cardId: 'pkmn-008-wartortle', quantity: 3 },
    { cardId: 'pkmn-009-blastoise', quantity: 2 },
    { cardId: 'pkmn-086-seel', quantity: 3 },
    { cardId: 'pkmn-087-dewgong', quantity: 2 },
    { cardId: 'pkmn-120-staryu', quantity: 2 },
    { cardId: 'trainer-potion', quantity: 3 },
    { cardId: 'trainer-super-potion', quantity: 2 },
    { cardId: 'trainer-switch', quantity: 2 },
    { cardId: 'trainer-nest-ball', quantity: 2 },
    { cardId: 'trainer-great-ball', quantity: 2 },
    { cardId: 'trainer-bills-training', quantity: 2 },
    { cardId: 'trainer-energy-retrieval', quantity: 2 },
    { cardId: 'trainer-professors-research', quantity: 2 },
    { cardId: 'trainer-marnie', quantity: 1 },
    { cardId: 'energy-water', quantity: 22 },
  ],
}

export const GRASS_STARTER_DECK: PresetDeck = {
  id: 'deck-grass-starter',
  name: 'Grass Starter',
  description: 'A resilient deck built around the Bulbasaur line. Sustain your team and grind out wins.',
  primaryType: 'grass',
  cards: [
    { cardId: 'pkmn-001-bulbasaur', quantity: 4 },
    { cardId: 'pkmn-002-ivysaur', quantity: 3 },
    { cardId: 'pkmn-003-venusaur', quantity: 2 },
    { cardId: 'pkmn-043-oddish', quantity: 3 },
    { cardId: 'pkmn-044-gloom', quantity: 2 },
    { cardId: 'pkmn-114-tangela', quantity: 2 },
    { cardId: 'trainer-potion', quantity: 3 },
    { cardId: 'trainer-super-potion', quantity: 2 },
    { cardId: 'trainer-switch', quantity: 2 },
    { cardId: 'trainer-nest-ball', quantity: 2 },
    { cardId: 'trainer-great-ball', quantity: 2 },
    { cardId: 'trainer-bills-training', quantity: 2 },
    { cardId: 'trainer-energy-retrieval', quantity: 2 },
    { cardId: 'trainer-professors-research', quantity: 2 },
    { cardId: 'trainer-marnie', quantity: 1 },
    { cardId: 'energy-grass', quantity: 22 },
  ],
}

// ─── New Decks ────────────────────────────────────────────────────────────────

export const EEVEE_EVOLUTIONS_DECK: PresetDeck = {
  id: 'deck-eevee-evolutions',
  name: 'Eevee Evolutions',
  description: 'A versatile deck centered on Eevee and its many evolutions. Surprise your opponent with multi-type power.',
  primaryType: 'colorless',
  cards: [
    { cardId: 'pkmn-133-eevee', quantity: 4 },
    { cardId: 'pkmn-135-jolteon', quantity: 2 },
    { cardId: 'pkmn-136-flareon', quantity: 2 },
    { cardId: 'pkmn-134-vaporeon', quantity: 2 },
    { cardId: 'pkmn-470-leafeon', quantity: 2 },
    { cardId: 'pkmn-125-electabuzz', quantity: 2 },
    { cardId: 'pkmn-126-magmar', quantity: 2 },
    { cardId: 'trainer-potion', quantity: 3 },
    { cardId: 'trainer-super-potion', quantity: 2 },
    { cardId: 'trainer-switch', quantity: 2 },
    { cardId: 'trainer-nest-ball', quantity: 3 },
    { cardId: 'trainer-bills-training', quantity: 3 },
    { cardId: 'trainer-professors-research', quantity: 2 },
    { cardId: 'trainer-energy-search', quantity: 2 },
    { cardId: 'energy-electric', quantity: 5 },
    { cardId: 'energy-fire', quantity: 5 },
    { cardId: 'energy-water', quantity: 5 },
    { cardId: 'energy-grass', quantity: 5 },
  ],
}

export const THUNDER_STRIKE_DECK: PresetDeck = {
  id: 'deck-thunder-strike',
  name: 'Thunder Strike',
  description: 'A fast and furious Electric deck. Charge up quickly and unleash devastating lightning attacks.',
  primaryType: 'electric',
  cards: [
    { cardId: 'pkmn-025-pikachu', quantity: 4 },
    { cardId: 'pkmn-026-raichu', quantity: 3 },
    { cardId: 'pkmn-125-electabuzz', quantity: 3 },
    { cardId: 'pkmn-100-voltorb', quantity: 3 },
    { cardId: 'pkmn-101-electrode', quantity: 2 },
    { cardId: 'pkmn-243-raikou', quantity: 2 },
    { cardId: 'pkmn-145-zapdos', quantity: 1 },
    { cardId: 'trainer-potion', quantity: 2 },
    { cardId: 'trainer-switch', quantity: 2 },
    { cardId: 'trainer-nest-ball', quantity: 3 },
    { cardId: 'trainer-great-ball', quantity: 2 },
    { cardId: 'trainer-bills-training', quantity: 3 },
    { cardId: 'trainer-energy-retrieval', quantity: 2 },
    { cardId: 'trainer-professors-research', quantity: 2 },
    { cardId: 'energy-electric', quantity: 24 },
  ],
}

export const COLORLESS_RUSH_DECK: PresetDeck = {
  id: 'deck-colorless-rush',
  name: 'Colorless Rush',
  description: 'A fast deck with no energy type weakness. Use any energy and overwhelm opponents with raw HP and power.',
  primaryType: 'colorless',
  cards: [
    { cardId: 'pkmn-113-chansey', quantity: 3 },
    { cardId: 'pkmn-143-snorlax', quantity: 3 },
    { cardId: 'pkmn-115-kangaskhan', quantity: 3 },
    { cardId: 'pkmn-052-meowth', quantity: 3 },
    { cardId: 'pkmn-053-persian', quantity: 2 },
    { cardId: 'pkmn-021-spearow', quantity: 3 },
    { cardId: 'pkmn-022-fearow', quantity: 2 },
    { cardId: 'pkmn-035-clefairy', quantity: 2 },
    { cardId: 'pkmn-036-clefable', quantity: 1 },
    { cardId: 'trainer-potion', quantity: 3 },
    { cardId: 'trainer-super-potion', quantity: 2 },
    { cardId: 'trainer-switch', quantity: 2 },
    { cardId: 'trainer-nest-ball', quantity: 2 },
    { cardId: 'trainer-bills-training', quantity: 3 },
    { cardId: 'trainer-professors-research', quantity: 2 },
    { cardId: 'energy-fire', quantity: 8 },
    { cardId: 'energy-water', quantity: 8 },
    { cardId: 'energy-grass', quantity: 6 },
  ],
}

export const TIDAL_WAVE_DECK: PresetDeck = {
  id: 'deck-tidal-wave',
  name: 'Tidal Wave',
  description: 'A powerful Water deck featuring Lapras and the legendary Gyarados. Weather the storm and crash hard.',
  primaryType: 'water',
  cards: [
    { cardId: 'pkmn-131-lapras', quantity: 3 },
    { cardId: 'pkmn-129-magikarp', quantity: 4 },
    { cardId: 'pkmn-130-gyarados', quantity: 3 },
    { cardId: 'pkmn-060-poliwag', quantity: 3 },
    { cardId: 'pkmn-061-poliwhirl', quantity: 2 },
    { cardId: 'pkmn-133-eevee', quantity: 2 },
    { cardId: 'pkmn-134-vaporeon', quantity: 2 },
    { cardId: 'trainer-potion', quantity: 2 },
    { cardId: 'trainer-super-potion', quantity: 2 },
    { cardId: 'trainer-switch', quantity: 2 },
    { cardId: 'trainer-nest-ball', quantity: 3 },
    { cardId: 'trainer-great-ball', quantity: 2 },
    { cardId: 'trainer-bills-training', quantity: 3 },
    { cardId: 'trainer-energy-retrieval', quantity: 2 },
    { cardId: 'trainer-professors-research', quantity: 2 },
    { cardId: 'energy-water', quantity: 23 },
  ],
}

export const ALL_PRESET_DECKS: PresetDeck[] = [
  FIRE_STARTER_DECK,
  WATER_STARTER_DECK,
  GRASS_STARTER_DECK,
  EEVEE_EVOLUTIONS_DECK,
  THUNDER_STRIKE_DECK,
  COLORLESS_RUSH_DECK,
  TIDAL_WAVE_DECK,
]
