# Rock Paper Scissors Multiplayer — Product Requirements Document

**Version:** 1.0
**Date:** 2026-05-15
**Status:** Draft
**Author:** Generated via Requirement Engineering Skill

---

## 1. Executive Summary

Upgrade the existing single-player RPS hero battle game (`/rps`) into a real-time 2-player multiplayer experience. Two players create or join a room by code, select heroes, and battle each other with server-authoritative round resolution. Backend uses the existing NestJS API extended with WebSocket (Socket.io) — Firebase is explicitly excluded from game state so the game does not inherit Firebase's connection limits or pricing for game rooms.

---

## 2. Problem Statement

The current RPS game at `/rps` is fully offline, single-player vs bot. All round logic runs client-side, and a streak is persisted only to `localStorage['rps-streak']`. There is no way for two real users to compete. Without multiplayer: users have no social replay value, can cheat trivially by reading client code, and a win streak means nothing because it is never validated against another human.

---

## 3. Goals & Non-Goals

**Goals:**
- Two real players can compete in real-time from separate browsers/devices
- Server resolves every round (no client can cheat outcome)
- Latency from last-player-submits to both players seeing result < 500 ms
- Reuse existing NestJS API and hero/UI assets with minimal new dependencies
- Room lifecycle is self-contained: create → join → play → cleanup — no manual admin needed

**Non-Goals (explicitly out of scope):**
- Firebase Realtime Database for game state (Firebase may remain for unrelated chat features)
- Ranked matchmaking, ELO, or ladder system (v1 is casual rooms only)
- Spectator / observer mode
- In-game voice or text chat during a match
- Mobile native app
- More than 2 players per room (no team or FFA mode)
- Persistent player accounts or login (v1 uses anonymous session tokens)

---

## 4. Target Users & Personas

| Persona | Role | Primary Need | Frequency of Use |
|---------|------|-------------|-----------------|
| Casual Visitor | Portfolio viewer who sees the RPS card | Challenge a friend via shared link, play one quick match | Once per visit |
| Developer / Recruiter | Evaluates Bright's full-stack skills | See real-time WebSocket feature working end-to-end | One-time evaluation |

---

## 5. Assumptions & Dependencies

**Assumptions** (must be validated before development):
- [ ] The existing NestJS backend can be extended with a WebSocket gateway (NestJS supports `@WebSocketGateway` via `socket.io`)
- [ ] The NestJS backend is deployed and reachable from the frontend at `VITE_API_BASE_URL` with a WebSocket-compatible path (e.g., `ws://api.domain/rps`)
- [ ] Room codes can be 6 uppercase alphanumeric characters — low collision risk for casual use
- [ ] 2-player match max HP remains 3 (matching current single-player design)
- [ ] A 30-second per-round choice timeout is acceptable UX (no player can stall indefinitely)
- [ ] No persistent DB needed for v1 — rooms held in NestJS in-memory map with TTL eviction is sufficient
- [ ] Supabase or a database is NOT required for v1 leaderboard; streaks can remain localStorage-based but are reset on game loss

**Dependencies** (must exist before frontend work begins):
- NestJS WebSocket Gateway deployed and tested with a `wss://` URL
- New env var `VITE_RPS_WS_URL` (WebSocket endpoint) added to `.env.example`
- Hero SVG assets already in `src/data/hero/` (15 heroes exist, no change needed)

---

## 6. Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| REQ-F01 | The system shall allow a player to create a new game room and receive a 6-character alphanumeric room code | Must | Given player clicks "Create Room", when the WebSocket connects, then a unique room code is displayed within 1 second |
| REQ-F02 | The system shall allow a second player to join an existing room by entering a valid room code | Must | Given player enters a valid 6-char code and clicks "Join", then they enter the same room as the creator within 1 second; invalid code shows error message |
| REQ-F03 | The system shall prevent a third player from joining a room that already has 2 players | Must | Given a full room (2 players), when a third player submits the room code, then they receive "Room is full" error and are not connected to the room |
| REQ-F04 | Both players shall be required to select a hero before the battle phase begins | Must | Given both players are in the room, when Player 1 selects a hero, the UI shows "Waiting for opponent to select hero"; battle starts only after both players confirm |
| REQ-F05 | The server shall accept each player's round choice (rock/paper/scissors) and withhold it from the opponent until both choices are submitted | Must | Given Player 1 submits "rock", Player 2 cannot receive Player 1's choice via any WebSocket event until Player 2 also submits; verify via browser devtools network tab |
| REQ-F06 | The server shall resolve the round outcome and emit the result (win/lose/draw + both choices) to both players simultaneously | Must | Given both players have submitted, within 500 ms both clients receive a `round_result` event containing `playerChoice`, `opponentChoice`, and `result` (win/lose/draw from each player's perspective) |
| REQ-F07 | The server shall decrement the losing player's HP by 1 per round and broadcast the updated HP state to both clients | Must | After each non-draw round, both clients show the correct updated HP for both heroes with no discrepancy |
| REQ-F08 | The server shall detect when either player's HP reaches 0, emit a `game_over` event to both clients with the winner's session ID, and mark the room as closed | Must | When HP hits 0, both players see the Game Over screen within 500 ms; further choice submissions are rejected by server |
| REQ-F09 | The system shall enforce a 30-second per-round choice timeout; if a player does not submit within 30 seconds, that player automatically loses the round | Must | Given 30 seconds pass with only one player submitting, the server treats the non-submitting player as if they chose the losing option; both clients receive normal `round_result` |
| REQ-F10 | The system shall display a live "waiting for opponent" indicator on the battle screen while waiting for the opponent's choice each round | Should | While the local player has submitted a choice but the opponent has not, the UI shows a spinner or pulsing text "Waiting for opponent…" and locks further choice input |
| REQ-F11 | The system shall handle a player disconnecting mid-game by notifying the remaining player and auto-awarding them victory after 15 seconds if the opponent does not reconnect | Should | Given Player 2 closes their tab, Player 1 sees "Opponent disconnected — waiting 15 s…"; after 15 s Player 1 sees Victory screen |
| REQ-F12 | The system shall allow a disconnected player to rejoin their active room within 15 seconds using the same room code and session token | Should | Given Player 2 refreshes mid-game within 15 s, they reconnect to the same room with correct HP state restored |
| REQ-F13 | The system shall provide a "Copy Room Link" button that copies a URL containing the room code to the clipboard | Should | Given the room code is `ABCD12`, clicking "Copy Link" copies `https://domain/rps?room=ABCD12` to clipboard; opening that URL on another device auto-fills the join field |
| REQ-F14 | The system shall auto-evict a room from server memory 10 minutes after the room becomes empty or the game ends | Could | Verify via server logs that room objects are removed after 10 min TTL without a server restart |
| REQ-F15 | The system shall display both players' heroes facing each other on the battle screen, with the local player on the left and the opponent on the right | Could | Opponent's hero image uses `scaleX(-1)` transform matching the existing bot-hero pattern |

---

## 7. Non-Functional Requirements

| ID | Category | Requirement | Measurement |
|----|----------|-------------|-------------|
| REQ-N01 | Performance | Round result delivered to both clients within 500 ms of the second player's submission | Manual stopwatch test; Chrome devtools WebSocket frame timestamps |
| REQ-N02 | Real-time transport | Game state must be pushed via persistent WebSocket connection — no HTTP polling | Verify no periodic `GET` requests to `/rps` in Network tab during a match |
| REQ-N03 | Concurrency | Server supports at least 20 simultaneous active rooms without perceptible degradation | Load test with 40 WebSocket connections (20 rooms × 2 players) |
| REQ-N04 | Backend independence | Game room state must not depend on Firebase in any way | Room events must work with `VITE_FIREBASE_*` env vars unset |
| REQ-N05 | Security | Server validates that a submitted choice belongs to the correct player session; a player cannot submit on behalf of their opponent | Unit test: emit choice from wrong session ID → server ignores and emits `error` event |
| REQ-N06 | Graceful degradation | If the WebSocket server is unavailable, the frontend falls back to the existing single-player (vs bot) mode with a banner "Multiplayer offline — playing vs AI" | Verify by pointing `VITE_RPS_WS_URL` to an invalid host |
| REQ-N07 | Connection UX | Players see a connection status indicator (connecting / connected / reconnecting) during the lobby phase | Throttle network in DevTools → indicator must update within 2 s |

---

## 8. Business Rules

| ID | Rule | Source |
|----|------|--------|
| REQ-B01 | Round outcome is determined exclusively by the server; client-side `resolveRound()` is removed from the multiplayer flow | Anti-cheat: client code is readable, so outcome must never be calculable from client-held data alone |
| REQ-B02 | A round does not resolve until both players submit OR the 30-second timeout fires — no partial reveals | Fairness: revealing one player's choice before the other submits enables copying |
| REQ-B03 | A room code is single-use per game session; once the game ends the code cannot be reused to start a new game | Prevents stale room links from accidentally joining a new match |
| REQ-B04 | Both players in a room must use distinct session tokens; a player cannot join their own room as both participants | Prevents single-user two-tab cheating in streak tracking |
| REQ-B05 | Streak tracking remains localStorage-based (client) for v1 — server does not validate streaks | Acceptable for casual portfolio demo; revisit if leaderboard is added |

---

## 9. User Stories

**Casual Visitor — creating a room**
- [ ] US-01: As a visitor, I want to create a room and share a link so that my friend can join without explaining anything.
  - AC: Given I click "Create Room", when the room is ready, then I see a room code AND a one-click "Copy Link" button; the link opens the join flow with the code pre-filled.

- [ ] US-02: As a visitor, I want to see my opponent's hero selection so that I know the battle is about to begin.
  - AC: Given both players are in the lobby, when my opponent selects a hero, then I see their hero displayed on the right side of the screen (mirrored) with their hero name label.

**Casual Visitor — playing a match**
- [ ] US-03: As a player, I want the round to resolve only after both of us have chosen so that neither of us can copy the other's move.
  - AC: Given I submit "rock", when my opponent hasn't submitted yet, then I see "Waiting for opponent…" and cannot change my choice; opponent's choice is hidden.

- [ ] US-04: As a player, I want to see the round result animation (hit flash, HP drain) so that the battle feels impactful.
  - AC: Given the server emits `round_result`, when I receive it, then within 300 ms the loser's hero shakes, HP bar animates, and floating "−1" appears — matching existing single-player animation quality.

- [ ] US-05: As a player, I want to know if my opponent disconnects so that I'm not waiting indefinitely.
  - AC: Given my opponent closes their browser, when 3 seconds pass with no heartbeat, then I see "Opponent disconnected — waiting 15 s…" and a countdown; after 15 s I see Victory.

**Casual Visitor — game over**
- [ ] US-06: As the winner, I want to see a Victory screen with my streak so that I feel rewarded.
  - AC: Given I reduce opponent HP to 0, when `game_over` arrives, then I see the Victory screen within 500 ms; my localStorage streak increments by 1.

- [ ] US-07: As the loser, I want a "Play Again" button that creates a new room so that I can challenge my opponent to a rematch.
  - AC: Given I see the Defeat screen, when I click "Play Again", then a fresh room is created and a new shareable link is generated; my streak resets to 0.

---

## 10. Conflicts & Open Questions

**Conflicts resolved:**

| Conflict | Resolution | Decision by |
|----------|-----------|-------------|
| Firebase vs WebSocket for real-time | WebSocket via NestJS Gateway — reuses existing backend, no Firebase dependency for game state | Requirement spec (user constraint: "not only Firebase") |
| Client-side `resolveRound()` vs server authority | Server resolves all multiplayer rounds; existing function retained only for the offline fallback mode | REQ-B01 |

**Open questions (unresolved):**
- [ ] **Reconnection window** — Is 15 seconds an acceptable wait before auto-victory? Could be too short on mobile. Owner: Bright — deadline: before backend implementation starts
- [ ] **Room code collision** — 6-char alphanumeric = 2.18 billion combos; acceptable for portfolio scale, but confirm if rooms must be globally unique or per-server-instance. Owner: Bright
- [ ] **`VITE_RPS_WS_URL` vs reusing `VITE_API_BASE_URL`** — Should the WebSocket use the same domain as the REST API (same NestJS server, different path) or a separate env var? Affects nginx config and CORS. Owner: Bright
- [ ] **Offline fallback trigger** — Should the app detect WebSocket failure and auto-switch to bot mode, or show an explicit error and let the user opt-in to single-player? Owner: Bright
- [ ] **Session token storage** — Use `sessionStorage` (tab-scoped, lost on refresh) or `localStorage` (survives refresh, enables REQ-F12 reconnection)? Reconnection requires `localStorage`. Owner: Bright

---

## 11. Out of Scope (Won't Have — v1)

- **Firebase for game rooms**: Firebase RTDB/Firestore may not be used for room state or round resolution. (Rationale: avoid vendor lock-in for game logic; Firebase is already used for chat and should remain isolated to that domain.)
- **Supabase or external DB**: No Supabase, PlanetScale, or other managed DB for v1. In-memory room map on NestJS is sufficient for a portfolio demo.
- **Ranked matchmaking / ELO**: Rooms are created manually by sharing a code. No automatic pairing.
- **Spectators**: Only the two players in a room receive events. No read-only observers.
- **Persistent leaderboard**: No server-side streak or win-rate storage. Revisit in v2.
- **Multiple rooms per session**: A player can only be in one active room at a time.

---

## 12. Success Metrics

| Metric | Baseline (today) | Target | Measurement method |
|--------|-----------------|--------|-------------------|
| Multiplayer match completable end-to-end | 0% (feature doesn't exist) | 100% of test matches complete without error | Manual QA: 5 matches across Chrome + Safari |
| Round result latency | N/A | < 500 ms (p95) from second player's submission | Chrome DevTools WebSocket frame timestamps |
| Server holding room in memory after game ends | N/A | Evicted within 10 min | Check server log for room GC event |
| Offline fallback activation | N/A | Bot mode activates within 3 s of WebSocket failure | DevTools → Offline → reload → see "playing vs AI" banner within 3 s |
| Firebase independence | N/A | Game fully playable with all `VITE_FIREBASE_*` vars unset | Remove Firebase vars from `.env`, play a full match |

---

## 13. Recommended Backend Architecture

> This section is advisory — not a constraint. Adjust based on deployment reality.

### Option A — NestJS WebSocket Gateway (Recommended)

Extend the existing NestJS API (`VITE_API_BASE_URL`) with a `@WebSocketGateway('/rps')` using Socket.io.

```
Frontend (React)
  └── socket.io-client → wss://api/rps
        └── NestJS RpsGateway
              ├── RpsRoomService  (in-memory Map<roomCode, RoomState>)
              └── emits: room_created | player_joined | hero_selected | round_result | game_over | player_disconnected
```

**Why:** No new infrastructure. NestJS already handles auth and REST; adding a gateway is additive. In-memory rooms with TTL eviction are sufficient for portfolio load.

**New env var:** `VITE_RPS_WS_URL=wss://api.domain` (or same as `VITE_API_BASE_URL` with `/rps` path)

### Option B — Supabase Realtime (Alternative)

Use Supabase Postgres for room/game records + Supabase Realtime channels for event broadcasting.

**Why you'd choose this:** Persistent game history, built-in auth, no WebSocket server to maintain.

**Why you wouldn't (v1):** Adds a new vendor dependency; room state in Postgres is overkill for ephemeral matches.

### Option C — Partykit (Alternative)

Deploy a Partykit server (Cloudflare Workers Durable Objects) that handles room state at the edge.

**Why you'd choose this:** Zero-latency globally; built for exactly this use case.

**Why you wouldn't (v1):** Separate deployment pipeline; unfamiliar stack; overkill for a portfolio demo with < 100 concurrent users.

---

## 14. Frontend Hook Design (Reference)

```ts
// src/hooks/useRpsRoom.ts (new file)

interface RoomState {
  roomCode: string
  phase: 'lobby' | 'hero-select' | 'battle' | 'gameover'
  playerHero: Hero | null
  opponentHero: Hero | null
  playerHp: number
  opponentHp: number
  playerChoice: Choice | null     // local player's submitted choice
  opponentChoice: Choice | null   // revealed only after round resolves
  roundResult: RoundResult
  isWaitingForOpponent: boolean
  winner: 'player' | 'opponent' | null
  connectionStatus: 'connecting' | 'connected' | 'reconnecting' | 'offline'
}

// Key events emitted to server:
// create_room, join_room, select_hero, submit_choice

// Key events received from server:
// room_created, player_joined, opponent_hero_selected,
// round_result, game_over, player_disconnected
```

New files to create:
- `src/hooks/useRpsRoom.ts` — WebSocket connection + room state
- `src/lib/rpsSocket.ts` — socket.io-client instance (mirrors pattern of `src/lib/firebase.ts`)

Existing file to modify:
- `src/pages/RpsPage.tsx` — add lobby screen (create/join), wire `useRpsRoom` hook; keep existing single-player screens as offline fallback

---

## 15. Open Questions Checklist (Pre-Development Gate)

Before any code is written, confirm:

- [ ] NestJS backend can be extended with WebSocket gateway (confirm with backend owner)
- [ ] WebSocket URL / env var naming decided
- [ ] Reconnection window (15 s) approved
- [ ] Session token storage strategy decided (`localStorage` recommended for reconnect support)
- [ ] Offline fallback UX decided (auto-switch vs explicit error)

**PRD Readiness:** This PRD is **not yet ready for development** — the 5 open questions above must be resolved before backend implementation begins. Frontend component work (lobby screen layout, `useRpsRoom` hook skeleton) can start in parallel.
