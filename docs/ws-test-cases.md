# WebSocket Test Cases — RPS Gateway

## Overview

| Item | Value |
|---|---|
| Protocol | Socket.IO (over WebSocket) |
| Namespace | `/rps` |
| Base URL | `http://localhost:3000` |
| Full URL | `http://localhost:3000/rps` |
| Transport | websocket (preferred), polling (fallback) |

---

## Postman Setup

1. Open Postman → **New** → **Socket.IO**
2. Enter URL: `http://localhost:3000/rps`
3. Under **Config** tab:
   - **Client version**: Socket.IO v4
   - **Handshake path**: `/socket.io`
4. Click **Connect**
5. To simulate two players, open a **second Postman tab** and repeat steps 1–4

> Each connected tab gets a unique `socket.id` assigned by the server.

---

## Phases Reference

```
lobby → hero-select → battle → gameover
```

| Phase | Description |
|---|---|
| `lobby` | Room created, waiting for second player |
| `hero-select` | Both players connected, choosing heroes |
| `battle` | Both heroes selected, round fighting |
| `gameover` | Game ended (win/lose/forfeit) |

---

## Events Reference

### Client → Server

| Event | Payload |
|---|---|
| `create_room` | `{ "sessionId": string }` |
| `join_room` | `{ "roomCode": string, "sessionId": string }` |
| `select_hero` | `{ "roomCode": string, "sessionId": string, "heroId": string }` |
| `submit_choice` | `{ "roomCode": string, "sessionId": string, "choice": "rock"\|"paper"\|"scissors" }` |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `room_created` | `{ "roomCode": string }` | Room created successfully |
| `player_joined` | `{ "sessionId": string, "roomCode": string }` | Broadcast to room when P2 joins |
| `hero_selected` | `{ "player": "self"\|"opponent", "heroId": string }` | Per-player perspective |
| `battle_start` | `{ "playerHero": string, "opponentHero": string, "playerHp": number, "opponentHp": number }` | Both players ready |
| `waiting_for_opponent` | `{}` | Only one choice submitted so far |
| `round_result` | `{ "playerChoice": string, "opponentChoice": string, "result": "win"\|"lose"\|"draw", "playerHp": number, "opponentHp": number }` | Round resolved |
| `game_over` | `{ "winner": string }` | Game ended, winner's sessionId |
| `player_disconnected` | `{ "reconnectWindowSecs": 15 }` | Opponent disconnected |
| `player_reconnected` | `{ "phase": string, "playerHp": number, "opponentHp": number, "opponentHero": string }` (to self) / `{}` (to room) | Opponent reconnected |
| `error` | `{ "code": string, "message": string }` | Operation failed |

---

## Test Cases

---

### TC-01 — Connect to Server

**Goal**: Verify a client can connect to the `/rps` namespace.

**Steps**:
1. In Postman, enter URL `http://localhost:3000/rps`
2. Click **Connect**

**Expected**:
- Connection status changes to **Connected**
- Server log: `connect id=<socketId> transport=websocket`

**Expected server log pattern**:
```
connect id=abc123 transport=websocket origin=- query={}
```

---

### TC-02 — Create Room (Happy Path)

**Goal**: Player 1 creates a new game room.

**Pre-condition**: TC-01 passed (P1 connected)

**Event sent** (P1 tab):
```json
Event: create_room
Body:
{
  "sessionId": "player-session-001"
}
```

**Expected event received** (P1 tab):
```json
Event: room_created
{
  "roomCode": "ABC123"
}
```

**Notes**:
- Save the `roomCode` value — it is needed for all subsequent test cases
- Room is now in `lobby` phase

---

### TC-03 — Join Room (Happy Path)

**Goal**: Player 2 joins the room created by P1.

**Pre-condition**: TC-02 passed; `roomCode` known

**Event sent** (P2 tab):
```json
Event: join_room
Body:
{
  "roomCode": "ABC123",
  "sessionId": "player-session-002"
}
```

**Expected events**:

| Receiver | Event | Payload |
|---|---|---|
| P1 | `player_joined` | `{ "sessionId": "player-session-002", "roomCode": "ABC123" }` |
| P2 | `player_joined` | `{ "sessionId": "player-session-002", "roomCode": "ABC123" }` |

**Notes**:
- Both players are now in `hero-select` phase
- The `player_joined` event is broadcast to the entire room (both tabs receive it)

---

### TC-04 — Select Hero (Both Players)

**Goal**: Both players select a hero, triggering `battle_start`.

**Pre-condition**: TC-03 passed (both in `hero-select` phase)

**Step 1 — P1 selects hero** (P1 tab):
```json
Event: select_hero
Body:
{
  "roomCode": "ABC123",
  "sessionId": "player-session-001",
  "heroId": "warrior"
}
```

**Expected after P1 selects**:

| Receiver | Event | Payload |
|---|---|---|
| P1 | `hero_selected` | `{ "player": "self", "heroId": "warrior" }` |
| P2 | `hero_selected` | `{ "player": "opponent", "heroId": "warrior" }` |

**Step 2 — P2 selects hero** (P2 tab):
```json
Event: select_hero
Body:
{
  "roomCode": "ABC123",
  "sessionId": "player-session-002",
  "heroId": "mage"
}
```

**Expected after P2 selects** (both players ready → `battle_start` emitted):

| Receiver | Event | Payload |
|---|---|---|
| P2 | `hero_selected` | `{ "player": "self", "heroId": "mage" }` |
| P1 | `hero_selected` | `{ "player": "opponent", "heroId": "mage" }` |
| P1 | `battle_start` | `{ "playerHero": "warrior", "opponentHero": "mage", "playerHp": 3, "opponentHp": 3 }` |
| P2 | `battle_start` | `{ "playerHero": "mage", "opponentHero": "warrior", "playerHp": 3, "opponentHp": 3 }` |

**Notes**:
- A 30-second round timer starts server-side after `battle_start`
- Each player sees their own perspective (`playerHero` = their own hero)

---

### TC-05 — Submit Choice: One Player Waiting

**Goal**: Only P1 submits a choice — P1 receives `waiting_for_opponent`.

**Pre-condition**: TC-04 passed (both in `battle` phase)

**Event sent** (P1 tab):
```json
Event: submit_choice
Body:
{
  "roomCode": "ABC123",
  "sessionId": "player-session-001",
  "choice": "rock"
}
```

**Expected** (P1 tab only):
```json
Event: waiting_for_opponent
{}
```

**Notes**:
- P2 receives nothing at this point
- Round timer is still running

---

### TC-06 — Submit Choice: Round Resolved (Win/Lose)

**Goal**: P2 submits after P1, round resolves with a winner.

**Pre-condition**: TC-05 passed (P1 chose `rock`)

**Event sent** (P2 tab):
```json
Event: submit_choice
Body:
{
  "roomCode": "ABC123",
  "sessionId": "player-session-002",
  "choice": "scissors"
}
```

**Expected** (round resolved — `rock` beats `scissors`):

| Receiver | Event | Payload |
|---|---|---|
| P1 | `round_result` | `{ "playerChoice": "rock", "opponentChoice": "scissors", "result": "win", "playerHp": 3, "opponentHp": 2 }` |
| P2 | `round_result` | `{ "playerChoice": "scissors", "opponentChoice": "rock", "result": "lose", "playerHp": 2, "opponentHp": 3 }` |

**Notes**:
- HP decreases for the loser (3 → 2)
- A new 30-second round timer starts
- Game is not over; continue to next round

---

### TC-07 — Submit Choice: Draw

**Goal**: Both players choose the same option — round ends in a draw, no HP loss.

**Pre-condition**: Both in `battle` phase

**P1 sends**:
```json
Event: submit_choice
Body:
{
  "roomCode": "ABC123",
  "sessionId": "player-session-001",
  "choice": "paper"
}
```

**P2 sends**:
```json
Event: submit_choice
Body:
{
  "roomCode": "ABC123",
  "sessionId": "player-session-002",
  "choice": "paper"
}
```

**Expected**:

| Receiver | Event | Payload |
|---|---|---|
| P1 | `round_result` | `{ "playerChoice": "paper", "opponentChoice": "paper", "result": "draw", "playerHp": <unchanged>, "opponentHp": <unchanged> }` |
| P2 | `round_result` | `{ "playerChoice": "paper", "opponentChoice": "paper", "result": "draw", "playerHp": <unchanged>, "opponentHp": <unchanged> }` |

**Notes**:
- HP values remain unchanged on a draw

---

### TC-08 — Game Over (HP Reaches Zero)

**Goal**: One player's HP drops to 0, triggering `game_over`.

**Pre-condition**: One player is at 1 HP (e.g., P2 at 1 HP after 2 losses)

**P1 sends** (winning move):
```json
Event: submit_choice
Body:
{
  "roomCode": "ABC123",
  "sessionId": "player-session-001",
  "choice": "rock"
}
```

**P2 sends** (losing move):
```json
Event: submit_choice
Body:
{
  "roomCode": "ABC123",
  "sessionId": "player-session-002",
  "choice": "scissors"
}
```

**Expected**:

| Receiver | Event | Payload |
|---|---|---|
| P1 | `round_result` | `{ "result": "win", "playerHp": 3, "opponentHp": 0 }` |
| P2 | `round_result` | `{ "result": "lose", "playerHp": 0, "opponentHp": 3 }` |
| P1 | `game_over` | `{ "winner": "player-session-001" }` |
| P2 | `game_over` | `{ "winner": "player-session-001" }` |

**Notes**:
- `game_over` is broadcast to the entire room
- `winner` field contains the winning player's `sessionId`
- Phase transitions to `gameover`

---

### TC-09 — Round Timeout (No Choices Submitted)

**Goal**: Neither player submits within 30 seconds — server auto-resolves as draw.

**Pre-condition**: Both in `battle` phase, round timer running

**Steps**:
1. Do **not** send `submit_choice` from either player
2. Wait 30 seconds

**Expected** (server auto-assigns `rock` vs `rock`):

| Receiver | Event | Payload |
|---|---|---|
| P1 | `round_result` | `{ "playerChoice": "rock", "opponentChoice": "rock", "result": "draw", "playerHp": <unchanged>, "opponentHp": <unchanged> }` |
| P2 | `round_result` | `{ "playerChoice": "rock", "opponentChoice": "rock", "result": "draw", "playerHp": <unchanged>, "opponentHp": <unchanged> }` |

**Notes**:
- If only one player submitted, the other is auto-assigned the **losing** choice (e.g., opponent chose `paper` → server gives non-submitter `rock`)
- New round timer starts after resolution

---

### TC-10 — Round Timeout (One Player Submitted)

**Goal**: P1 submits, P2 does not — server penalises P2 after 30 seconds.

**Pre-condition**: Both in `battle` phase

**Steps**:
1. P1 sends `submit_choice` with `choice: "paper"` → P1 receives `waiting_for_opponent`
2. Wait 30 seconds without P2 submitting

**Expected** (server assigns P2 a losing choice — `rock` loses to `paper`):

| Receiver | Event | Payload |
|---|---|---|
| P1 | `round_result` | `{ "playerChoice": "paper", "opponentChoice": "rock", "result": "win", "playerHp": <unchanged>, "opponentHp": <P2 hp - 1> }` |
| P2 | `round_result` | `{ "playerChoice": "rock", "opponentChoice": "paper", "result": "lose", "playerHp": <P2 hp - 1>, "opponentHp": <unchanged> }` |

---

### TC-11 — Player Disconnects (Reconnect Within Window)

**Goal**: P2 disconnects and reconnects within the 15-second window.

**Pre-condition**: Both in `battle` phase

**Step 1 — P2 disconnects**:
- In P2's Postman tab, click **Disconnect**

**Expected** (P1 tab):
```json
Event: player_disconnected
{
  "reconnectWindowSecs": 15
}
```

**Step 2 — P2 reconnects within 15 seconds**:
- In P2's tab, click **Connect** (new socket ID assigned)
- P2 sends `join_room` with the same `sessionId`:
```json
Event: join_room
Body:
{
  "roomCode": "ABC123",
  "sessionId": "player-session-002"
}
```

**Expected**:

| Receiver | Event | Payload |
|---|---|---|
| P2 | `player_reconnected` | `{ "phase": "battle", "playerHp": <P2 hp>, "opponentHp": <P1 hp>, "opponentHero": "warrior" }` |
| P1 | `player_reconnected` | `{}` |

**Notes**:
- The 15-second forfeit timer is cancelled
- Game resumes from current state

---

### TC-12 — Player Disconnects (Reconnect Window Expired → Forfeit)

**Goal**: P2 disconnects and does not reconnect within 15 seconds — P2 forfeits.

**Pre-condition**: Both in `battle` phase

**Step 1 — P2 disconnects**:
- In P2's Postman tab, click **Disconnect**

**Expected** (P1 tab):
```json
Event: player_disconnected
{
  "reconnectWindowSecs": 15
}
```

**Step 2 — Wait 15 seconds without reconnecting**

**Expected** (P1 tab, after 15 seconds):
```json
Event: game_over
{
  "winner": "player-session-001"
}
```

**Notes**:
- P1 wins by forfeit
- Phase transitions to `gameover`

---

### TC-13 — Join Non-Existent Room (Error)

**Goal**: Verify the server returns an error when joining a room that does not exist.

**Pre-condition**: P1 connected

**Event sent** (P1 tab):
```json
Event: join_room
Body:
{
  "roomCode": "XXXXXX",
  "sessionId": "player-session-001"
}
```

**Expected** (P1 tab):
```json
Event: error
{
  "code": "ROOM_NOT_FOUND",
  "message": "ROOM_NOT_FOUND"
}
```

---

## Full Game Flow Summary

```
P1 connects                       → (connected)
P2 connects                       → (connected)

P1: create_room                   → room_created { roomCode }
P2: join_room                     → player_joined (broadcast to room)

P1: select_hero { heroId }        → hero_selected (self + opponent)
P2: select_hero { heroId }        → hero_selected (self + opponent)
                                  → battle_start (per-player, HP=3)

[Round loop]
P1: submit_choice { choice }      → waiting_for_opponent (P1 only)
P2: submit_choice { choice }      → round_result (per-player perspective)
                                  → game_over (if HP=0)

[Repeat until game_over]
```

---

## Choice Matrix

| P1 \ P2 | rock | paper | scissors |
|---|---|---|---|
| **rock** | draw | P2 wins | P1 wins |
| **paper** | P1 wins | draw | P2 wins |
| **scissors** | P2 wins | P1 wins | draw |

---

## Error Codes

| Code | Trigger |
|---|---|
| `ROOM_NOT_FOUND` | `join_room` with invalid `roomCode` |
| `CREATE_FAILED` | Unexpected error during room creation |
| Other error messages | Passed through as-is from use case exceptions |
