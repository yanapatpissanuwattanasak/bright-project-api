# Backend Implementation Plan — RPS Multiplayer WebSocket

**Source:** `req.md` v1.0  
**Date:** 2026-05-15  
**Scope:** NestJS backend only (Option A from PRD §13)

---

## 1. Architecture Decision

Use **NestJS WebSocket Gateway** via `@nestjs/websockets` + `socket.io`.  
Room state persists in **PostgreSQL** (existing TypeORM connection) — survives server restarts and supports reconnection (REQ-F12).  
Timer handles (30-s round, 15-s reconnect) remain in-process via `setTimeout`; `expires_at` column + `@Cron` job handles 10-min TTL eviction.

```
Frontend (React)
  └── socket.io-client → wss://api/rps
        └── RpsGateway  (presentation/gateways/rps.gateway.ts)
              ├── RpsRoomRepository  (infrastructure/database/repositories/rps-room.typeorm-repository.ts)
              │     └── PostgreSQL  rps_rooms  UNLOGGED table  (JSONB players column)
              └── RpsUseCases  (application/use-cases/rps/)
```

---

## 2. Open Questions — Must Resolve Before Coding

| # | Question | Default recommendation |
|---|----------|------------------------|
| Q1 | WebSocket URL — same domain as REST (`/rps` path) or separate env var? | Same NestJS server, add namespace `/rps`. Use `VITE_RPS_WS_URL` pointing to same host. |
| Q2 | Session token storage — `sessionStorage` or `localStorage`? | `localStorage` — required for REQ-F12 reconnection within 15 s. |
| Q3 | Reconnection window — is 15 s acceptable on mobile? | Keep 15 s for v1; revisit if UX feedback says otherwise. |
| Q4 | Offline fallback UX — auto-switch to bot or explicit error? | Auto-switch after 3 s connection failure (REQ-N06). |
| Q5 | Room code globally unique or per-server-instance? | Globally unique via `PRIMARY KEY` on `room_code` column. |

> **Gate:** Do not start Step 4 (Gateway) until Q1 and Q2 are answered.

---

## 3. New Files to Create

All files follow the existing clean-architecture layer order in `src/`.

```
src/
├── domain/
│   ├── entities/
│   │   └── rps-room.entity.ts                          ← RoomState, PlayerState, Choice, Phase
│   ├── repositories/
│   │   └── i-rps-room.repository.ts                    ← repository port (interface)
│   └── value-objects/
│       └── room-code.vo.ts                             ← 6-char alphanumeric generator + validator
│
├── application/
│   └── use-cases/
│       └── rps/
│           ├── create-room.use-case.ts
│           ├── join-room.use-case.ts
│           ├── select-hero.use-case.ts
│           └── submit-choice.use-case.ts
│
├── infrastructure/
│   └── database/
│       ├── orm-entities/
│       │   └── rps-room.orm-entity.ts                  ← TypeORM @Entity mapping
│       ├── repositories/
│       │   └── rps-room.typeorm-repository.ts          ← implements IRpsRoomRepository
│       └── migrations/
│           └── 1746000000005-CreateRpsRoomsTable.ts    ← UNLOGGED table + index
│
└── presentation/
    ├── gateways/
    │   └── rps.gateway.ts                              ← @WebSocketGateway('/rps') + all events
    └── modules/
        └── rps.module.ts                               ← wires gateway + repository + use-cases
```

**Existing file to modify:**  
`src/presentation/modules/app.module.ts` — import `RpsModule`.

**New packages to install:**  
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @nestjs/schedule   # for @Cron TTL eviction job
```

---

## 4. Database Schema

### Migration: `1746000000005-CreateRpsRoomsTable.ts`

```sql
CREATE UNLOGGED TABLE rps_rooms (
  room_code   CHAR(6)      PRIMARY KEY,
  phase       VARCHAR(12)  NOT NULL DEFAULT 'lobby'
                             CHECK (phase IN ('lobby','hero-select','battle','gameover')),
  players     JSONB        NOT NULL DEFAULT '[]',
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rps_rooms_expires ON rps_rooms (expires_at);
```

**Why `UNLOGGED`:** WAL is skipped — writes are ~3× faster. Data is lost on crash, which is acceptable for ephemeral game sessions.  
**Why JSONB for `players`:** Avoids a join on every round event. Each player object is ≤ 200 bytes; the column stays small.

### `players` JSONB shape

```json
[
  {
    "sessionId": "abc123",
    "socketId":  "s_xyz",
    "heroId":    "warrior",
    "hp":        3,
    "choice":    null,
    "connected": true
  }
]
```

---

## 5. Domain Layer

### `rps-room.entity.ts`

```ts
export type Choice = 'rock' | 'paper' | 'scissors'
export type Phase  = 'lobby' | 'hero-select' | 'battle' | 'gameover'

export interface PlayerState {
  sessionId: string
  socketId:  string
  heroId:    string | null
  hp:        number        // starts at 3
  choice:    Choice | null // null until submitted this round
  connected: boolean
}

export interface RoomState {
  roomCode:   string
  phase:      Phase
  players:    [PlayerState] | [PlayerState, PlayerState]
  expiresAt:  Date
  createdAt:  Date
}
```

### `i-rps-room.repository.ts`

```ts
export interface IRpsRoomRepository {
  create(roomCode: string, player: PlayerState): Promise<RoomState>
  findByCode(roomCode: string): Promise<RoomState | null>
  findBySocketId(socketId: string): Promise<RoomState | null>
  save(room: RoomState): Promise<void>
  delete(roomCode: string): Promise<void>
  deleteExpired(): Promise<number>   // returns count evicted (for @Cron job log)
}
```

### `room-code.vo.ts`

- Generate: `crypto.randomBytes(3).toString('hex').toUpperCase()` → 6-char hex (A–F, 0–9).
- Validate: `/^[A-F0-9]{6}$/`.

---

## 6. WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create_room` | `{ sessionId: string }` | Creates a new room; returns `room_created` |
| `join_room` | `{ roomCode: string, sessionId: string }` | Joins existing room; returns `player_joined` or `error` |
| `select_hero` | `{ heroId: string }` | Sets player's hero; triggers `hero_selected` to both |
| `submit_choice` | `{ choice: Choice }` | Submits round choice; server holds until both submit |

### Server → Client

| Event | Payload | Audience |
|-------|---------|----------|
| `room_created` | `{ roomCode: string }` | Creator only |
| `player_joined` | `{ sessionId: string, roomCode: string }` | Both players |
| `hero_selected` | `{ player: 'self'\|'opponent', heroId: string }` | Both players |
| `battle_start` | `{ playerHero, opponentHero }` | Both players (phase → battle) |
| `waiting_for_opponent` | `{}` | Player who submitted first |
| `round_result` | `{ playerChoice, opponentChoice, result: 'win'\|'lose'\|'draw', playerHp, opponentHp }` | Both players (perspective-flipped per player) |
| `game_over` | `{ winner: sessionId }` | Both players |
| `player_disconnected` | `{ reconnectWindowSecs: 15 }` | Remaining player |
| `player_reconnected` | `{ phase, playerHp, opponentHp, opponentHero }` | Rejoining player |
| `error` | `{ code: string, message: string }` | Requesting client |

---

## 7. Game State Machine

```
[lobby]
  │  create_room / join_room (2 players connected)
  ▼
[hero-select]
  │  both players emit select_hero
  ▼
[battle]
  │  loop: submit_choice (both) → round_result → decrement HP → save to DB
  │  if HP == 0 → game_over
  ▼
[gameover]
  │  phase = 'gameover' written to DB
  │  expires_at = NOW() + 10 min (Cron job evicts)
```

---

## 8. Business Rules Implementation

| Rule (from PRD) | Implementation |
|-----------------|---------------|
| REQ-B01: Server resolves rounds | `resolveRound(c1, c2)` lives only in `submit-choice.use-case.ts` |
| REQ-B02: No partial reveal | `players[n].choice` stored in DB; `round_result` emitted only when both are non-null |
| REQ-B03: Room code single-use | After `game_over`, `phase = 'gameover'`; `join_room` rejects with `error.ROOM_CLOSED` |
| REQ-B04: Distinct session tokens | `join_room` rejects if `sessionId` already exists in `players[0]` |
| REQ-N05: Validate session on submit | Gateway checks `socket.id` matches `socketId` stored in DB for that `sessionId` |
| REQ-F09: 30-s round timeout | `setTimeout` per round; on fire, auto-assign losing choice, save to DB, resolve |
| REQ-F11: 15-s reconnect window | `setTimeout` on `disconnect`; on fire, set `game_over`, emit victory to remaining player |
| REQ-F12: Reconnect support | `join_room` with existing `sessionId` + valid `roomCode` restores state from DB |
| REQ-F14: 10-min TTL eviction | `expires_at` column + `@Cron('* * * * *')` calls `repository.deleteExpired()` |

---

## 9. `RpsRoomTypeormRepository` (Infrastructure)

Wraps a TypeORM `Repository<RpsRoomOrmEntity>`. All methods convert between the ORM entity and the domain `RoomState`.

Key notes:
- `save()` does an upsert on `room_code` (primary key).
- `findBySocketId()` uses a Postgres JSONB containment query: `WHERE players @> '[{"socketId":"<id>"}]'`.
- `deleteExpired()` runs `DELETE FROM rps_rooms WHERE expires_at < NOW()` — called by the Cron job.

---

## 10. `RpsGateway` (Presentation)

```ts
@WebSocketGateway({ namespace: '/rps', cors: { origin: process.env.RPS_WS_CORS_ORIGIN } })
export class RpsGateway implements OnGatewayDisconnect {
  @SubscribeMessage('create_room')   handleCreateRoom(...)
  @SubscribeMessage('join_room')     handleJoinRoom(...)
  @SubscribeMessage('select_hero')   handleSelectHero(...)
  @SubscribeMessage('submit_choice') handleSubmitChoice(...)
  handleDisconnect(client: Socket)   // looks up room by socketId → triggers 15-s reconnect window
}
```

All handlers call the corresponding use-case → emit events via `server.to(roomCode).emit(...)`.  
Round and reconnect timers are stored in a gateway-level `Map<roomCode, NodeJS.Timeout>` (not in DB — timer handles are process-local).

---

## 11. New Env Var

Add to `.env.example`:
```
RPS_WS_CORS_ORIGIN=http://localhost:5173
```

Frontend will use `VITE_RPS_WS_URL` pointing to the same host as `VITE_API_BASE_URL` with namespace `/rps`.

---

## 12. Implementation Order (Phased)

### Phase 1 — Core happy path
1. Install packages (`@nestjs/websockets`, `socket.io`, `@nestjs/schedule`)
2. `room-code.vo.ts` + `rps-room.entity.ts` + `i-rps-room.repository.ts`
3. Migration `1746000000005-CreateRpsRoomsTable.ts` + `rps-room.orm-entity.ts`
4. `RpsRoomTypeormRepository` — create, findByCode, save, delete
5. Use-cases: `create-room`, `join-room`, `select-hero`, `submit-choice`
6. `RpsGateway` — all 4 event handlers + basic disconnect handling
7. `RpsModule` + wire into `AppModule`
8. Manual test: two browser tabs, full match end-to-end

### Phase 2 — Timeouts & resilience
9. 30-second round timeout (REQ-F09)
10. 15-second reconnect window (REQ-F11, REQ-F12) — restore state from DB on rejoin
11. `@Cron` TTL eviction job + `deleteExpired()` (REQ-F14)

### Phase 3 — Hardening
12. Session validation guard (REQ-N05)
13. Unit tests: `resolveRound`, session mismatch rejection, JSONB query
14. Load test: 40 concurrent WebSocket connections (REQ-N03)

---

## 13. Success Criteria (from PRD §12)

- [ ] Full match playable end-to-end in two browser tabs
- [ ] Round result delivered < 500 ms (DevTools WebSocket frame timestamps)
- [ ] Room row deleted from `rps_rooms` within 10 min of game end (check DB + server logs)
- [ ] Game works with all `VITE_FIREBASE_*` vars unset
- [ ] Third-player join attempt returns `error.ROOM_FULL`
- [ ] Wrong-session choice submission returns `error.UNAUTHORIZED`
- [ ] Disconnected player can rejoin within 15 s and see correct HP state from DB
