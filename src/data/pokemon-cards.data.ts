import { EnergyCard, PokemonCard, TrainerCard } from '@domain/entities/pokemon-card.entity'

const SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`

// ─── Fire Pokemon ────────────────────────────────────────────────────────────

export const CHARMANDER: PokemonCard = {
  id: 'pkmn-004-charmander',
  cardType: 'pokemon',
  name: 'Charmander',
  pokemonType: 'fire',
  hp: 70,
  stage: 'basic',
  attacks: [
    { name: 'Scratch', energyCost: ['colorless'], damage: 10 },
    { name: 'Ember', energyCost: ['fire', 'colorless'], damage: 30 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(4),
}

export const CHARMELEON: PokemonCard = {
  id: 'pkmn-005-charmeleon',
  cardType: 'pokemon',
  name: 'Charmeleon',
  pokemonType: 'fire',
  hp: 100,
  stage: 'stage1',
  evolvesFrom: 'Charmander',
  attacks: [
    { name: 'Slash', energyCost: ['colorless', 'colorless'], damage: 30 },
    { name: 'Flamethrower', energyCost: ['fire', 'fire'], damage: 60 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(5),
}

export const CHARIZARD: PokemonCard = {
  id: 'pkmn-006-charizard',
  cardType: 'pokemon',
  name: 'Charizard',
  pokemonType: 'fire',
  hp: 160,
  stage: 'stage2',
  evolvesFrom: 'Charmeleon',
  attacks: [
    { name: 'Wing Attack', energyCost: ['colorless', 'colorless'], damage: 40 },
    { name: 'Fire Spin', energyCost: ['fire', 'fire', 'fire'], damage: 120 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 3,
  imageUrl: SPRITE(6),
}

export const VULPIX: PokemonCard = {
  id: 'pkmn-037-vulpix',
  cardType: 'pokemon',
  name: 'Vulpix',
  pokemonType: 'fire',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Tail Whip', energyCost: ['colorless'], damage: 10 },
    { name: 'Ember', energyCost: ['fire', 'colorless'], damage: 30 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(37),
}

export const NINETALES: PokemonCard = {
  id: 'pkmn-038-ninetales',
  cardType: 'pokemon',
  name: 'Ninetales',
  pokemonType: 'fire',
  hp: 110,
  stage: 'stage1',
  evolvesFrom: 'Vulpix',
  attacks: [
    { name: 'Confuse Ray', energyCost: ['fire', 'colorless'], damage: 30 },
    { name: 'Fire Blast', energyCost: ['fire', 'fire', 'colorless'], damage: 80 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(38),
}

export const GROWLITHE: PokemonCard = {
  id: 'pkmn-058-growlithe',
  cardType: 'pokemon',
  name: 'Growlithe',
  pokemonType: 'fire',
  hp: 80,
  stage: 'basic',
  attacks: [
    { name: 'Bite', energyCost: ['colorless'], damage: 20 },
    { name: 'Flare', energyCost: ['fire', 'fire'], damage: 50 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(58),
}

export const ARCANINE: PokemonCard = {
  id: 'pkmn-059-arcanine',
  cardType: 'pokemon',
  name: 'Arcanine',
  pokemonType: 'fire',
  hp: 130,
  stage: 'stage1',
  evolvesFrom: 'Growlithe',
  attacks: [
    { name: 'Take Down', energyCost: ['colorless', 'colorless', 'colorless'], damage: 50 },
    { name: 'Flamethrower', energyCost: ['fire', 'fire', 'colorless'], damage: 80 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 3,
  imageUrl: SPRITE(59),
}

export const PONYTA: PokemonCard = {
  id: 'pkmn-077-ponyta',
  cardType: 'pokemon',
  name: 'Ponyta',
  pokemonType: 'fire',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Stampede', energyCost: ['colorless'], damage: 10 },
    { name: 'Flame Tail', energyCost: ['fire', 'colorless'], damage: 30 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(77),
}

export const MAGMAR: PokemonCard = {
  id: 'pkmn-126-magmar',
  cardType: 'pokemon',
  name: 'Magmar',
  pokemonType: 'fire',
  hp: 80,
  stage: 'basic',
  attacks: [
    { name: 'Smokescreen', energyCost: ['fire', 'colorless'], damage: 30 },
    { name: 'Fire Punch', energyCost: ['fire', 'fire', 'colorless'], damage: 60 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(126),
}

export const FLAREON: PokemonCard = {
  id: 'pkmn-136-flareon',
  cardType: 'pokemon',
  name: 'Flareon',
  pokemonType: 'fire',
  hp: 100,
  stage: 'stage1',
  evolvesFrom: 'Eevee',
  attacks: [
    { name: 'Quick Attack', energyCost: ['colorless', 'colorless'], damage: 30 },
    { name: 'Flamethrower', energyCost: ['fire', 'fire', 'colorless'], damage: 70 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(136),
}

export const MOLTRES: PokemonCard = {
  id: 'pkmn-146-moltres',
  cardType: 'pokemon',
  name: 'Moltres',
  pokemonType: 'fire',
  hp: 100,
  stage: 'basic',
  attacks: [
    { name: 'Agility', energyCost: ['colorless', 'colorless'], damage: 30 },
    { name: 'Wildfire', energyCost: ['fire', 'fire', 'fire'], damage: 90 },
  ],
  weakness: { type: 'water', multiplier: 2 },
  retreatCost: 3,
  imageUrl: SPRITE(146),
}

// ─── Water Pokemon ───────────────────────────────────────────────────────────

export const SQUIRTLE: PokemonCard = {
  id: 'pkmn-007-squirtle',
  cardType: 'pokemon',
  name: 'Squirtle',
  pokemonType: 'water',
  hp: 70,
  stage: 'basic',
  attacks: [
    { name: 'Tackle', energyCost: ['colorless'], damage: 10 },
    { name: 'Water Gun', energyCost: ['water', 'colorless'], damage: 30 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(7),
}

export const WARTORTLE: PokemonCard = {
  id: 'pkmn-008-wartortle',
  cardType: 'pokemon',
  name: 'Wartortle',
  pokemonType: 'water',
  hp: 90,
  stage: 'stage1',
  evolvesFrom: 'Squirtle',
  attacks: [
    { name: 'Scratch', energyCost: ['colorless', 'colorless'], damage: 30 },
    { name: 'Surf', energyCost: ['water', 'water'], damage: 50 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(8),
}

export const BLASTOISE: PokemonCard = {
  id: 'pkmn-009-blastoise',
  cardType: 'pokemon',
  name: 'Blastoise',
  pokemonType: 'water',
  hp: 150,
  stage: 'stage2',
  evolvesFrom: 'Wartortle',
  attacks: [
    { name: 'Hydro Pump', energyCost: ['water', 'colorless'], damage: 40 },
    { name: 'Surf', energyCost: ['water', 'water', 'water'], damage: 90 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 3,
  imageUrl: SPRITE(9),
}

export const PSYDUCK: PokemonCard = {
  id: 'pkmn-054-psyduck',
  cardType: 'pokemon',
  name: 'Psyduck',
  pokemonType: 'water',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Headache', energyCost: ['colorless'], damage: 10 },
    { name: 'Psybeam', energyCost: ['water', 'colorless'], damage: 30 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(54),
}

export const GOLDUCK: PokemonCard = {
  id: 'pkmn-055-golduck',
  cardType: 'pokemon',
  name: 'Golduck',
  pokemonType: 'water',
  hp: 100,
  stage: 'stage1',
  evolvesFrom: 'Psyduck',
  attacks: [
    { name: 'Hyper Voice', energyCost: ['water', 'water'], damage: 50 },
    { name: 'Psych Up', energyCost: ['water', 'water', 'colorless'], damage: 70 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(55),
}

export const SEEL: PokemonCard = {
  id: 'pkmn-086-seel',
  cardType: 'pokemon',
  name: 'Seel',
  pokemonType: 'water',
  hp: 80,
  stage: 'basic',
  attacks: [
    { name: 'Headbutt', energyCost: ['colorless', 'colorless'], damage: 20 },
    { name: 'Aurora Beam', energyCost: ['water', 'colorless'], damage: 40 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(86),
}

export const DEWGONG: PokemonCard = {
  id: 'pkmn-087-dewgong',
  cardType: 'pokemon',
  name: 'Dewgong',
  pokemonType: 'water',
  hp: 100,
  stage: 'stage1',
  evolvesFrom: 'Seel',
  attacks: [
    { name: 'Ice Beam', energyCost: ['water', 'colorless'], damage: 40 },
    { name: 'Surf', energyCost: ['water', 'water', 'colorless'], damage: 70 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 3,
  imageUrl: SPRITE(87),
}

export const STARYU: PokemonCard = {
  id: 'pkmn-120-staryu',
  cardType: 'pokemon',
  name: 'Staryu',
  pokemonType: 'water',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Slap', energyCost: ['colorless'], damage: 10 },
    { name: 'Swift', energyCost: ['water', 'colorless'], damage: 40 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(120),
}

export const POLIWAG: PokemonCard = {
  id: 'pkmn-060-poliwag',
  cardType: 'pokemon',
  name: 'Poliwag',
  pokemonType: 'water',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Bubble', energyCost: ['water'], damage: 10 },
    { name: 'Water Gun', energyCost: ['water', 'colorless'], damage: 30 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(60),
}

export const POLIWHIRL: PokemonCard = {
  id: 'pkmn-061-poliwhirl',
  cardType: 'pokemon',
  name: 'Poliwhirl',
  pokemonType: 'water',
  hp: 90,
  stage: 'stage1',
  evolvesFrom: 'Poliwag',
  attacks: [
    { name: 'Hypnosis', energyCost: ['colorless', 'colorless'], damage: 20 },
    { name: 'Surf', energyCost: ['water', 'water'], damage: 60 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(61),
}

export const LAPRAS: PokemonCard = {
  id: 'pkmn-131-lapras',
  cardType: 'pokemon',
  name: 'Lapras',
  pokemonType: 'water',
  hp: 100,
  stage: 'basic',
  attacks: [
    { name: 'Sing', energyCost: ['colorless'], damage: 10 },
    { name: 'Blizzard', energyCost: ['water', 'water', 'colorless'], damage: 70 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(131),
}

export const VAPOREON: PokemonCard = {
  id: 'pkmn-134-vaporeon',
  cardType: 'pokemon',
  name: 'Vaporeon',
  pokemonType: 'water',
  hp: 100,
  stage: 'stage1',
  evolvesFrom: 'Eevee',
  attacks: [
    { name: 'Tackle', energyCost: ['colorless'], damage: 20 },
    { name: 'Hydro Pump', energyCost: ['water', 'water', 'colorless'], damage: 70 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(134),
}

export const MAGIKARP: PokemonCard = {
  id: 'pkmn-129-magikarp',
  cardType: 'pokemon',
  name: 'Magikarp',
  pokemonType: 'water',
  hp: 30,
  stage: 'basic',
  attacks: [
    { name: 'Splash', energyCost: ['colorless'], damage: 0, effect: 'Does absolutely nothing.' },
    { name: 'Tackle', energyCost: ['colorless'], damage: 10 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(129),
}

export const GYARADOS: PokemonCard = {
  id: 'pkmn-130-gyarados',
  cardType: 'pokemon',
  name: 'Gyarados',
  pokemonType: 'water',
  hp: 130,
  stage: 'stage1',
  evolvesFrom: 'Magikarp',
  attacks: [
    { name: 'Bite', energyCost: ['colorless', 'colorless'], damage: 30 },
    { name: 'Hydro Pump', energyCost: ['water', 'water', 'colorless'], damage: 90 },
  ],
  weakness: { type: 'electric', multiplier: 2 },
  retreatCost: 3,
  imageUrl: SPRITE(130),
}

// ─── Grass Pokemon ───────────────────────────────────────────────────────────

export const BULBASAUR: PokemonCard = {
  id: 'pkmn-001-bulbasaur',
  cardType: 'pokemon',
  name: 'Bulbasaur',
  pokemonType: 'grass',
  hp: 80,
  stage: 'basic',
  attacks: [
    { name: 'Vine Whip', energyCost: ['grass'], damage: 20 },
    { name: 'Razor Leaf', energyCost: ['grass', 'colorless'], damage: 40 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(1),
}

export const IVYSAUR: PokemonCard = {
  id: 'pkmn-002-ivysaur',
  cardType: 'pokemon',
  name: 'Ivysaur',
  pokemonType: 'grass',
  hp: 100,
  stage: 'stage1',
  evolvesFrom: 'Bulbasaur',
  attacks: [
    { name: 'Vine Whip', energyCost: ['grass', 'colorless'], damage: 40 },
    { name: 'Poisonpowder', energyCost: ['grass', 'grass'], damage: 60 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(2),
}

export const VENUSAUR: PokemonCard = {
  id: 'pkmn-003-venusaur',
  cardType: 'pokemon',
  name: 'Venusaur',
  pokemonType: 'grass',
  hp: 160,
  stage: 'stage2',
  evolvesFrom: 'Ivysaur',
  attacks: [
    { name: 'Solar Beam', energyCost: ['grass', 'grass', 'colorless'], damage: 70 },
    { name: 'Frenzy Plant', energyCost: ['grass', 'grass', 'grass'], damage: 120 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(3),
}

export const ODDISH: PokemonCard = {
  id: 'pkmn-043-oddish',
  cardType: 'pokemon',
  name: 'Oddish',
  pokemonType: 'grass',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Stun Spore', energyCost: ['grass'], damage: 10 },
    { name: 'Absorb', energyCost: ['grass', 'colorless'], damage: 30 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(43),
}

export const GLOOM: PokemonCard = {
  id: 'pkmn-044-gloom',
  cardType: 'pokemon',
  name: 'Gloom',
  pokemonType: 'grass',
  hp: 80,
  stage: 'stage1',
  evolvesFrom: 'Oddish',
  attacks: [
    { name: 'Poisonpowder', energyCost: ['grass', 'colorless'], damage: 40 },
    { name: 'Petal Dance', energyCost: ['grass', 'grass'], damage: 60 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(44),
}

export const BELLSPROUT: PokemonCard = {
  id: 'pkmn-069-bellsprout',
  cardType: 'pokemon',
  name: 'Bellsprout',
  pokemonType: 'grass',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Vine Whip', energyCost: ['grass'], damage: 10 },
    { name: 'Wrap', energyCost: ['grass', 'colorless'], damage: 30 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(69),
}

export const TANGELA: PokemonCard = {
  id: 'pkmn-114-tangela',
  cardType: 'pokemon',
  name: 'Tangela',
  pokemonType: 'grass',
  hp: 90,
  stage: 'basic',
  attacks: [
    { name: 'Bind', energyCost: ['grass', 'colorless'], damage: 30 },
    { name: 'Mega Drain', energyCost: ['grass', 'grass'], damage: 50, effect: 'Heal 20 damage from this Pokémon.' },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(114),
}

export const SCYTHER: PokemonCard = {
  id: 'pkmn-123-scyther',
  cardType: 'pokemon',
  name: 'Scyther',
  pokemonType: 'grass',
  hp: 80,
  stage: 'basic',
  attacks: [
    { name: 'Agility', energyCost: ['colorless', 'colorless'], damage: 20 },
    { name: 'Slash', energyCost: ['colorless', 'colorless', 'colorless'], damage: 50 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(123),
}

export const PINSIR: PokemonCard = {
  id: 'pkmn-127-pinsir',
  cardType: 'pokemon',
  name: 'Pinsir',
  pokemonType: 'grass',
  hp: 80,
  stage: 'basic',
  attacks: [
    { name: 'Seismic Toss', energyCost: ['colorless', 'colorless'], damage: 30 },
    { name: 'Guillotine', energyCost: ['grass', 'grass', 'colorless'], damage: 70 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 2,
  imageUrl: SPRITE(127),
}

export const EXEGGCUTE: PokemonCard = {
  id: 'pkmn-102-exeggcute',
  cardType: 'pokemon',
  name: 'Exeggcute',
  pokemonType: 'grass',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Leech Seed', energyCost: ['grass'], damage: 20 },
    { name: 'Egg Bomb', energyCost: ['grass', 'colorless'], damage: 40 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(102),
}

export const EXEGGUTOR: PokemonCard = {
  id: 'pkmn-103-exeggutor',
  cardType: 'pokemon',
  name: 'Exeggutor',
  pokemonType: 'grass',
  hp: 110,
  stage: 'stage1',
  evolvesFrom: 'Exeggcute',
  attacks: [
    { name: 'Confusion', energyCost: ['grass', 'colorless'], damage: 30 },
    { name: 'Solar Beam', energyCost: ['grass', 'grass', 'colorless'], damage: 80 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 3,
  imageUrl: SPRITE(103),
}

export const LEAFEON: PokemonCard = {
  id: 'pkmn-470-leafeon',
  cardType: 'pokemon',
  name: 'Leafeon',
  pokemonType: 'grass',
  hp: 90,
  stage: 'stage1',
  evolvesFrom: 'Eevee',
  attacks: [
    { name: 'Quick Attack', energyCost: ['colorless'], damage: 20 },
    { name: 'Razor Leaf', energyCost: ['grass', 'grass'], damage: 60 },
  ],
  weakness: { type: 'fire', multiplier: 2 },
  retreatCost: 1,
  imageUrl: SPRITE(470),
}

// ─── Electric Pokemon ────────────────────────────────────────────────────────

export const PIKACHU: PokemonCard = {
  id: 'pkmn-025-pikachu',
  cardType: 'pokemon',
  name: 'Pikachu',
  pokemonType: 'electric',
  hp: 70,
  stage: 'basic',
  attacks: [
    { name: 'Thunder Jolt', energyCost: ['electric'], damage: 20 },
    { name: 'Thunderbolt', energyCost: ['electric', 'electric'], damage: 50 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(25),
}

export const RAICHU: PokemonCard = {
  id: 'pkmn-026-raichu',
  cardType: 'pokemon',
  name: 'Raichu',
  pokemonType: 'electric',
  hp: 110,
  stage: 'stage1',
  evolvesFrom: 'Pikachu',
  attacks: [
    { name: 'Agility', energyCost: ['electric', 'colorless'], damage: 30 },
    { name: 'Thunder', energyCost: ['electric', 'electric', 'colorless'], damage: 90 },
  ],
  retreatCost: 2,
  imageUrl: SPRITE(26),
}

export const MAGNEMITE: PokemonCard = {
  id: 'pkmn-081-magnemite',
  cardType: 'pokemon',
  name: 'Magnemite',
  pokemonType: 'electric',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Tackle', energyCost: ['colorless'], damage: 10 },
    { name: 'Sonicboom', energyCost: ['electric', 'colorless'], damage: 30 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(81),
}

export const ELECTABUZZ: PokemonCard = {
  id: 'pkmn-125-electabuzz',
  cardType: 'pokemon',
  name: 'Electabuzz',
  pokemonType: 'electric',
  hp: 80,
  stage: 'basic',
  attacks: [
    { name: 'Electric Jolt', energyCost: ['electric'], damage: 20 },
    { name: 'Thunderpunch', energyCost: ['electric', 'electric'], damage: 50 },
  ],
  retreatCost: 2,
  imageUrl: SPRITE(125),
}

export const ZAPDOS: PokemonCard = {
  id: 'pkmn-145-zapdos',
  cardType: 'pokemon',
  name: 'Zapdos',
  pokemonType: 'electric',
  hp: 110,
  stage: 'basic',
  attacks: [
    { name: 'Thunderstorm', energyCost: ['electric', 'colorless'], damage: 40 },
    { name: 'Thunder', energyCost: ['electric', 'electric', 'colorless'], damage: 80 },
  ],
  retreatCost: 3,
  imageUrl: SPRITE(145),
}

export const VOLTORB: PokemonCard = {
  id: 'pkmn-100-voltorb',
  cardType: 'pokemon',
  name: 'Voltorb',
  pokemonType: 'electric',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Tackle', energyCost: ['colorless'], damage: 10 },
    { name: 'Spark', energyCost: ['electric', 'colorless'], damage: 30 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(100),
}

export const ELECTRODE: PokemonCard = {
  id: 'pkmn-101-electrode',
  cardType: 'pokemon',
  name: 'Electrode',
  pokemonType: 'electric',
  hp: 90,
  stage: 'stage1',
  evolvesFrom: 'Voltorb',
  attacks: [
    { name: 'Thunder', energyCost: ['electric', 'electric'], damage: 60 },
    { name: 'Self Destruct', energyCost: ['colorless', 'colorless', 'colorless'], damage: 100, effect: 'This Pokémon also does 100 damage to itself.' },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(101),
}

export const RAIKOU: PokemonCard = {
  id: 'pkmn-243-raikou',
  cardType: 'pokemon',
  name: 'Raikou',
  pokemonType: 'electric',
  hp: 100,
  stage: 'basic',
  attacks: [
    { name: 'Quick Attack', energyCost: ['colorless', 'colorless'], damage: 30 },
    { name: 'Crunch', energyCost: ['electric', 'electric', 'colorless'], damage: 80 },
  ],
  retreatCost: 2,
  imageUrl: SPRITE(243),
}

// ─── Colorless Pokemon ───────────────────────────────────────────────────────

export const EEVEE: PokemonCard = {
  id: 'pkmn-133-eevee',
  cardType: 'pokemon',
  name: 'Eevee',
  pokemonType: 'colorless',
  hp: 70,
  stage: 'basic',
  attacks: [
    { name: 'Tail Whap', energyCost: ['colorless'], damage: 10 },
    { name: 'Gnaw', energyCost: ['colorless', 'colorless'], damage: 30 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(133),
}

export const JOLTEON: PokemonCard = {
  id: 'pkmn-135-jolteon',
  cardType: 'pokemon',
  name: 'Jolteon',
  pokemonType: 'electric',
  hp: 90,
  stage: 'stage1',
  evolvesFrom: 'Eevee',
  attacks: [
    { name: 'Quick Attack', energyCost: ['colorless'], damage: 20 },
    { name: 'Pin Missile', energyCost: ['electric', 'electric'], damage: 60 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(135),
}

export const CHANSEY: PokemonCard = {
  id: 'pkmn-113-chansey',
  cardType: 'pokemon',
  name: 'Chansey',
  pokemonType: 'colorless',
  hp: 120,
  stage: 'basic',
  attacks: [
    { name: 'Minimize', energyCost: ['colorless'], damage: 10 },
    { name: 'Egg Bomb', energyCost: ['colorless', 'colorless', 'colorless'], damage: 60 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(113),
}

export const SNORLAX: PokemonCard = {
  id: 'pkmn-143-snorlax',
  cardType: 'pokemon',
  name: 'Snorlax',
  pokemonType: 'colorless',
  hp: 100,
  stage: 'basic',
  attacks: [
    { name: 'Tackle', energyCost: ['colorless', 'colorless'], damage: 30 },
    { name: 'Body Slam', energyCost: ['colorless', 'colorless', 'colorless'], damage: 60 },
  ],
  retreatCost: 4,
  imageUrl: SPRITE(143),
}

export const KANGASKHAN: PokemonCard = {
  id: 'pkmn-115-kangaskhan',
  cardType: 'pokemon',
  name: 'Kangaskhan',
  pokemonType: 'colorless',
  hp: 90,
  stage: 'basic',
  attacks: [
    { name: 'Fetch', energyCost: ['colorless'], damage: 10 },
    { name: 'Comet Punch', energyCost: ['colorless', 'colorless', 'colorless'], damage: 60 },
  ],
  retreatCost: 2,
  imageUrl: SPRITE(115),
}

export const MEOWTH: PokemonCard = {
  id: 'pkmn-052-meowth',
  cardType: 'pokemon',
  name: 'Meowth',
  pokemonType: 'colorless',
  hp: 50,
  stage: 'basic',
  attacks: [
    { name: 'Scratch', energyCost: ['colorless'], damage: 10 },
    { name: 'Pay Day', energyCost: ['colorless', 'colorless'], damage: 20 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(52),
}

export const PERSIAN: PokemonCard = {
  id: 'pkmn-053-persian',
  cardType: 'pokemon',
  name: 'Persian',
  pokemonType: 'colorless',
  hp: 80,
  stage: 'stage1',
  evolvesFrom: 'Meowth',
  attacks: [
    { name: 'Scratch', energyCost: ['colorless'], damage: 20 },
    { name: 'Slash', energyCost: ['colorless', 'colorless', 'colorless'], damage: 60 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(53),
}

export const SPEAROW: PokemonCard = {
  id: 'pkmn-021-spearow',
  cardType: 'pokemon',
  name: 'Spearow',
  pokemonType: 'colorless',
  hp: 50,
  stage: 'basic',
  attacks: [
    { name: 'Gust', energyCost: ['colorless'], damage: 10 },
    { name: 'Fury Attack', energyCost: ['colorless', 'colorless'], damage: 20 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(21),
}

export const FEAROW: PokemonCard = {
  id: 'pkmn-022-fearow',
  cardType: 'pokemon',
  name: 'Fearow',
  pokemonType: 'colorless',
  hp: 80,
  stage: 'stage1',
  evolvesFrom: 'Spearow',
  attacks: [
    { name: 'Wing Attack', energyCost: ['colorless', 'colorless'], damage: 30 },
    { name: 'Drill Peck', energyCost: ['colorless', 'colorless', 'colorless'], damage: 60 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(22),
}

export const CLEFAIRY: PokemonCard = {
  id: 'pkmn-035-clefairy',
  cardType: 'pokemon',
  name: 'Clefairy',
  pokemonType: 'colorless',
  hp: 60,
  stage: 'basic',
  attacks: [
    { name: 'Sing', energyCost: ['colorless'], damage: 10 },
    { name: 'Metronome', energyCost: ['colorless', 'colorless'], damage: 30 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(35),
}

export const CLEFABLE: PokemonCard = {
  id: 'pkmn-036-clefable',
  cardType: 'pokemon',
  name: 'Clefable',
  pokemonType: 'colorless',
  hp: 90,
  stage: 'stage1',
  evolvesFrom: 'Clefairy',
  attacks: [
    { name: 'Minimize', energyCost: ['colorless'], damage: 10 },
    { name: 'Moonblast', energyCost: ['colorless', 'colorless', 'colorless'], damage: 70 },
  ],
  retreatCost: 1,
  imageUrl: SPRITE(36),
}

// ─── Trainer Cards ────────────────────────────────────────────────────────────

export const POTION: TrainerCard = {
  id: 'trainer-potion',
  cardType: 'trainer',
  name: 'Potion',
  trainerSubtype: 'item',
  effect: 'HEAL_30',
  effectText: 'Heal 30 damage from 1 of your Pokémon.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
}

export const SUPER_POTION: TrainerCard = {
  id: 'trainer-super-potion',
  cardType: 'trainer',
  name: 'Super Potion',
  trainerSubtype: 'item',
  effect: 'HEAL_60_DISCARD_ENERGY',
  effectText: 'Heal 60 damage from 1 of your Pokémon. Discard 1 Energy from that Pokémon.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png',
}

export const FULL_HEAL: TrainerCard = {
  id: 'trainer-full-heal',
  cardType: 'trainer',
  name: 'Full Heal',
  trainerSubtype: 'item',
  effect: 'FULL_HEAL',
  effectText: 'Remove all special conditions from 1 of your Pokémon.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/full-heal.png',
}

export const SWITCH: TrainerCard = {
  id: 'trainer-switch',
  cardType: 'trainer',
  name: 'Switch',
  trainerSubtype: 'item',
  effect: 'SWITCH',
  effectText: 'Switch your Active Pokémon with 1 of your Benched Pokémon.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
}

export const POKEMON_COMMUNICATION: TrainerCard = {
  id: 'trainer-pokemon-communication',
  cardType: 'trainer',
  name: 'Pokémon Communication',
  trainerSubtype: 'item',
  effect: 'SEARCH_POKEMON_IN_DECK',
  effectText: 'Put a Pokémon from your hand into your deck, then search your deck for a Pokémon and put it in your hand.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
}

export const ENERGY_RETRIEVAL: TrainerCard = {
  id: 'trainer-energy-retrieval',
  cardType: 'trainer',
  name: 'Energy Retrieval',
  trainerSubtype: 'item',
  effect: 'RETRIEVE_2_ENERGY',
  effectText: 'Put up to 2 basic Energy cards from your discard pile into your hand.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ether.png',
}

export const ENERGY_SEARCH: TrainerCard = {
  id: 'trainer-energy-search',
  cardType: 'trainer',
  name: 'Energy Search',
  trainerSubtype: 'item',
  effect: 'SEARCH_BASIC_ENERGY',
  effectText: 'Search your deck for a basic Energy card, reveal it, and put it into your hand.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ether.png',
}

export const GREAT_BALL: TrainerCard = {
  id: 'trainer-great-ball',
  cardType: 'trainer',
  name: 'Great Ball',
  trainerSubtype: 'item',
  effect: 'SEARCH_TOP_7_POKEMON',
  effectText: 'Look at the top 7 cards of your deck. You may reveal a Pokémon you find there and put it into your hand.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
}

export const PROFESSORS_RESEARCH: TrainerCard = {
  id: 'trainer-professors-research',
  cardType: 'trainer',
  name: "Professor's Research",
  trainerSubtype: 'supporter',
  effect: 'DRAW_7_DISCARD_HAND',
  effectText: 'Discard your hand, then draw 7 cards.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
}

export const MARNIE: TrainerCard = {
  id: 'trainer-marnie',
  cardType: 'trainer',
  name: 'Marnie',
  trainerSubtype: 'supporter',
  effect: 'MARNIE_SHUFFLE',
  effectText: 'Each player shuffles their hand into their deck. You draw 5 cards; your opponent draws 4 cards.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
}

export const BILLS_TRAINING: TrainerCard = {
  id: 'trainer-bills-training',
  cardType: 'trainer',
  name: "Bill's Training",
  trainerSubtype: 'item',
  effect: 'DRAW_2',
  effectText: 'Draw 2 cards.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
}

export const NEST_BALL: TrainerCard = {
  id: 'trainer-nest-ball',
  cardType: 'trainer',
  name: 'Nest Ball',
  trainerSubtype: 'item',
  effect: 'SEARCH_BASIC_POKEMON',
  effectText: 'Search your deck for a Basic Pokémon and put it directly onto your Bench.',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
}

// ─── Energy Cards ─────────────────────────────────────────────────────────────

export const FIRE_ENERGY: EnergyCard = {
  id: 'energy-fire',
  cardType: 'energy',
  name: 'Fire Energy',
  energyType: 'fire',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-gem.png',
}

export const WATER_ENERGY: EnergyCard = {
  id: 'energy-water',
  cardType: 'energy',
  name: 'Water Energy',
  energyType: 'water',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-gem.png',
}

export const GRASS_ENERGY: EnergyCard = {
  id: 'energy-grass',
  cardType: 'energy',
  name: 'Grass Energy',
  energyType: 'grass',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/grass-gem.png',
}

export const ELECTRIC_ENERGY: EnergyCard = {
  id: 'energy-electric',
  cardType: 'energy',
  name: 'Electric Energy',
  energyType: 'electric',
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/electric-gem.png',
}

// ─── Registries ──────────────────────────────────────────────────────────────

export const ALL_POKEMON_CARDS: PokemonCard[] = [
  // Fire
  CHARMANDER, CHARMELEON, CHARIZARD,
  VULPIX, NINETALES,
  GROWLITHE, ARCANINE,
  PONYTA,
  MAGMAR,
  FLAREON,
  MOLTRES,
  // Water
  SQUIRTLE, WARTORTLE, BLASTOISE,
  PSYDUCK, GOLDUCK,
  SEEL, DEWGONG,
  STARYU,
  POLIWAG, POLIWHIRL,
  LAPRAS,
  VAPOREON,
  MAGIKARP, GYARADOS,
  // Grass
  BULBASAUR, IVYSAUR, VENUSAUR,
  ODDISH, GLOOM,
  BELLSPROUT,
  TANGELA,
  SCYTHER,
  PINSIR,
  EXEGGCUTE, EXEGGUTOR,
  LEAFEON,
  // Electric
  PIKACHU, RAICHU,
  MAGNEMITE,
  ELECTABUZZ,
  ZAPDOS,
  VOLTORB, ELECTRODE,
  RAIKOU,
  // Colorless
  EEVEE,
  JOLTEON,
  CHANSEY,
  SNORLAX,
  KANGASKHAN,
  MEOWTH, PERSIAN,
  SPEAROW, FEAROW,
  CLEFAIRY, CLEFABLE,
]

export const ALL_TRAINER_CARDS: TrainerCard[] = [
  POTION, SUPER_POTION, FULL_HEAL, SWITCH,
  POKEMON_COMMUNICATION, ENERGY_RETRIEVAL, ENERGY_SEARCH, GREAT_BALL,
  PROFESSORS_RESEARCH, MARNIE,
  BILLS_TRAINING, NEST_BALL,
]

export const ALL_ENERGY_CARDS: EnergyCard[] = [
  FIRE_ENERGY, WATER_ENERGY, GRASS_ENERGY, ELECTRIC_ENERGY,
]

export const CARD_REGISTRY = new Map<string, PokemonCard | TrainerCard | EnergyCard>(
  [...ALL_POKEMON_CARDS, ...ALL_TRAINER_CARDS, ...ALL_ENERGY_CARDS].map(c => [c.id, c]),
)
