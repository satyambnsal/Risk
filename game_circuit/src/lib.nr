mod common;
mod game_initialization;
mod game_mechanics;
mod mpc;
mod test;

use common::{AdjacencyMap, GameMove, GameState, PlayerState};
use game_initialization::{
    assign_initial_territories, commit_to_user_secrets, create_risk_adjacency_map,
    initialize_game_state, initialize_player_state,
};
use game_mechanics::{end_turn, execute_move};
use mpc::{update_player_view, update_territory_visibility};

// Initialize a new Risk game
pub fn init_risk_game(num_players: u32, random_seed: Field) -> (GameState, AdjacencyMap) {
    assert(
        num_players >= 2 & num_players <= common::constants::MAX_PLAYERS,
        "Invalid number of players",
    );

    // Initialize game state
    let game_state = initialize_game_state(num_players);

    // Create adjacency map for the Risk board
    let adjacency_map = create_risk_adjacency_map();

    // Assign territories to players
    let updated_game = assign_initial_territories(game_state, num_players, random_seed);

    (updated_game, adjacency_map)
}

// Register a player to the game
pub fn register_player(
    game_state: GameState,
    player_id: Field,
    encrypt_secret: Field,
    mask_secret: Field,
) -> (GameState, PlayerState) {
    // Initialize player state
    let player_state = initialize_player_state(player_id, encrypt_secret, mask_secret);

    // Commit player secrets to the game state
    let updated_game = commit_to_user_secrets(game_state, encrypt_secret, mask_secret, player_id);

    // Update player's visibility
    let updated_player = update_territory_visibility(player_state, updated_game);

    // Update player's view of visible territories
    let final_player = update_player_view(updated_game, updated_player);

    (updated_game, final_player)
}

// Make a move in the game
pub fn make_move(
    game_state: GameState,
    player_state: PlayerState,
    adjacency_map: AdjacencyMap,
    game_move: GameMove,
) -> (GameState, PlayerState, bool) {
    // Execute the move and get the updated states
    let (updated_game, temp_player, success) =
        execute_move(game_state, player_state, adjacency_map, game_move);

    if !success {
        (game_state, player_state, false)
    } else {
        let updated_player = update_territory_visibility(temp_player, updated_game);

        // Update player's view of the territories
        let final_player = update_player_view(updated_game, updated_player);

        (updated_game, final_player, true)
    }
}

// Get current game state (for a specific player)
pub fn get_game_state(
    game_state: GameState,
    player_state: PlayerState,
) -> (GameState, PlayerState) {
    // Update player's visibility of territories
    let updated_player = update_territory_visibility(player_state, game_state);

    // Update player's view
    let final_player = update_player_view(game_state, updated_player);

    (game_state, final_player)
}

// Check if the game has ended and who won
pub fn check_game_status(game_state: GameState) -> (bool, Field) {
    (game_state.game_ended, game_state.winner)
}
