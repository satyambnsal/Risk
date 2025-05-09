# Fog of Noir

A Territorial Conquest game built with Noir circuits and NextJS, offering a novel approach to classic territory conquest gameplay with zero-knowledge proofs.

## Live Demo

The game is available online at: [fog-of-noir.vercel.app](http://fog-of-noir.vercel.app/)

## Project Structure

- **Frontend**: NextJS application with PhaserJS game engine
- **Circuits**: Noir zero-knowledge circuits in the `game_circuits` folder

## Game Circuits

The game logic is implemented as zero-knowledge circuits using the Noir language. These circuits handle game state transitions while maintaining player privacy.

### Core Game Circuits

The following circuits handle all game mechanics:

- `initialise_game_state`: Sets up the initial game board state
- `assign_initial_territories`: Randomly distributes territories among players
- `initialize_player_state`: Sets up a player's initial game state
- `register_all_players`: Registers all players in the game session
- `commit_to_user_secrets`: Securely stores player secrets
- `create_risk_adjacency_map`: Establishes territory connections
- `place_troops`: Allows players to place troops on territories
- `execute_attack`: Handles attack mechanics between territories
- `execute_fortify`: Allows redeployment of troops
- `end_turn`: Processes end-of-turn state changes
- `count_player_territories`: Tallies territories owned by each player
- `check_win_condition`: Determines if a player has won
- `count_player_territories`: Counts territories by player (used in win conditions)

### Testing

Test cases covering the full game journey for a two-player game are available in:
```
game_circuits/src/test.nr
```

Run the test suite with:
```bash
nargo test
```

### Compiling Circuits

To compile and export the circuits for use in the frontend:

```bash
nargo export
./generate_ts_bindings.sh  # Generates TypeScript bindings
```

Gate count reports for circuit complexity are available in `game_circuits/gates_report.json`.

## Frontend

The game frontend is built with modern web technologies:

- **NextJS**: React framework for the application
- **Tailwind CSS**: For styling components
- **PhaserJS**: Game engine for rendering and interaction
- **Radix UI**: Component library for UI elements
- **Colyseus.js**: Multiplayer functionality (in development)

### Local Development

To run the game locally:

```bash
# Install dependencies (requires Bun)
bun install

# Start development server
bun dev
```

## Dependencies

The game circuits use the MPC library for zero-knowledge computations:

```
mpclib = { tag = "main", git = "https://github.com/zac-williamson/mpclib" }
```

## License
MIT
