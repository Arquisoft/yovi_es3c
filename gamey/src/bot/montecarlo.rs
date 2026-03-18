//! A Monte Carlo tree search based bot implementation.
//!
//! This module provides [`MonteCarloBot`], a bot that uses Monte Carlo simulations
//! to evaluate moves and select the most promising one.

use crate::{Coordinates, GameY, Movement, PlayerId, YBot};
use rand::prelude::IndexedRandom;

/// A bot that chooses moves using Monte Carlo simulations.
///
/// This bot evaluates each possible move by simulating multiple random games
/// from that position. It selects the move that results in the highest win rate
/// across simulations, providing a good balance between strategic play and
/// computational efficiency.
///
/// # Parameters
///
/// - `simulations`: Number of random games to simulate per move evaluation
/// - `seed`: Optional random seed for reproducibility (None for true randomness)
pub struct MonteCarloBot {
    simulations: u32,
}

impl MonteCarloBot {
    /// Creates a new Monte Carlo bot with the specified number of simulations.
    ///
    /// More simulations lead to better move quality but slower evaluation.
    /// A reasonable default is 100-500 simulations depending on performance needs.
    pub fn new(simulations: u32) -> Self {
        Self { simulations }
    }

    /// Simulates a random game from the current position.
    ///
    /// Continues playing with random moves until the game reaches an end state,
    /// then returns the winner.
    fn simulate_game(&self, initial_game: &GameY, current_player: PlayerId) -> Option<PlayerId> {
        let mut game = initial_game.clone();

        while !game.check_game_over() {
            let available = game.available_cells();
            if available.is_empty() {
                break;
            }

            let cell_idx = available.choose(&mut rand::rng())?;
            let coords = Coordinates::from_index(*cell_idx, game.board_size());
            let next_player = game.next_player()?;
            let movement = Movement::Placement {
                player: next_player,
                coords,
            };

            if game.add_move(movement).is_err() {
                break;
            }
        }

        match game.status() {
            crate::core::game::GameStatus::Finished { winner } => Some(*winner),
            crate::core::game::GameStatus::Ongoing { .. } => None,
        }
    }

    /// Evaluates a move by simulating multiple games with that move applied.
    ///
    /// Returns the win rate (wins / total_simulations) for the current player.
    fn evaluate_move(
        &self,
        board: &GameY,
        coords: Coordinates,
        current_player: PlayerId,
    ) -> f64 {
        let mut game = board.clone();
        let movement = Movement::Placement {
            player: current_player,
            coords,
        };

        if game.add_move(movement).is_err() {
            return 0.0;
        }

        if game.check_game_over() {
            // If this move wins immediately, return perfect score
            match game.status() {
                crate::core::game::GameStatus::Finished { winner } => {
                    return if *winner == current_player { 1.0 } else { 0.0 };
                }
                crate::core::game::GameStatus::Ongoing { .. } => {}
            }
        }

        let mut wins = 0;
        for _ in 0..self.simulations {
            if let Some(winner) = self.simulate_game(&game, current_player) {
                if winner == current_player {
                    wins += 1;
                }
            }
        }

        wins as f64 / self.simulations as f64
    }
}

impl Default for MonteCarloBot {
    fn default() -> Self {
        Self::new(100)
    }
}

impl YBot for MonteCarloBot {
    fn name(&self) -> &str {
        "montecarlo_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available = board.available_cells();
        if available.is_empty() {
            return None;
        }

        let current_player = board.next_player()?;
        let mut best_score = f64::NEG_INFINITY;
        let mut best_candidates: Vec<Coordinates> = Vec::new();

        for idx in available {
            let coords = Coordinates::from_index(*idx, board.board_size());
            let score = self.evaluate_move(board, coords, current_player);

            if score > best_score {
                best_score = score;
                best_candidates.clear();
                best_candidates.push(coords);
            } else if (score - best_score).abs() < f64::EPSILON {
                // Ties at the same score
                best_candidates.push(coords);
            }
        }

        // Randomly break ties among best candidates
        best_candidates.choose(&mut rand::rng()).copied()
    }
}
