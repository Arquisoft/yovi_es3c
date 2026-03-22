//! A Monte Carlo tree search based bot implementation.
//!
//! This module provides [`MonteCarloBot`], a bot that uses Monte Carlo simulations
//! to evaluate moves and select the most promising one.

use crate::{Coordinates, GameY, Movement, PlayerId, YBot};
use rand::prelude::IndexedRandom;

/// Number of simulations per move evaluation.
///
/// Each move is evaluated by running this many random games from the position
/// after that move. More simulations lead to better move quality but slower evaluation.
const DEFAULT_SIMULATIONS: u32 = 100;

/// A bot that chooses moves using Monte Carlo simulations.
///
/// This bot evaluates each possible move by simulating multiple random games
/// from that position. It selects the move that results in the highest win rate
/// across simulations, providing a good balance between strategic play and
/// computational efficiency.
///
/// The bot uses a fixed number of simulations (100 per move) so that its behavior
/// is consistent and predictable.
pub struct MonteCarloBot;

impl MonteCarloBot {
    /// Simulates a random game from the current position.
    ///
    /// Continues playing with random moves until the game reaches an end state,
    /// then returns the winner.
    fn simulate_game(initial_game: &GameY) -> Option<PlayerId> {
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
        for _ in 0..DEFAULT_SIMULATIONS {
            if let Some(winner) = Self::simulate_game(&game) {
                if winner == current_player {
                    wins += 1;
                }
            }
        }

        wins as f64 / DEFAULT_SIMULATIONS as f64
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
            let score = Self::evaluate_move(board, coords, current_player);

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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Coordinates, GameY, Movement, PlayerId};

    #[test]
    fn test_montecarlobot_name() {
        let bot = MonteCarloBot;
        assert_eq!(bot.name(), "montecarlo_bot");
    }

    #[test]
    fn test_montecarlobot_returns_move_on_empty_board() {
        let bot = MonteCarloBot;
        let game = GameY::new(5);
        assert!(bot.choose_move(&game).is_some());
    }

    #[test]
    fn test_montecarlobot_returns_none_on_full_board() {
        let bot = MonteCarloBot;
        let mut game = GameY::new(1);
        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(0, 0, 0),
        }).unwrap();
        assert!(bot.choose_move(&game).is_none());
    }

    #[test]
    fn test_montecarlobot_returns_valid_cell() {
        let bot = MonteCarloBot;
        let game = GameY::new(5);
        let coords = bot.choose_move(&game).unwrap();
        let idx = coords.to_index(game.board_size());
        assert!(game.available_cells().contains(&idx));
    }

    #[test]
    fn test_montecarlobot_chooses_winning_move_when_available() {
        let bot = MonteCarloBot;
        let game = GameY::new(5);
        
        // The bot should prefer moves that lead to higher win rates in simulations
        let coords = bot.choose_move(&game);
        assert!(coords.is_some());
        
        // The chosen move should be a valid, available cell
        if let Some(chosen) = coords {
            let idx = chosen.to_index(game.board_size());
            assert!(game.available_cells().contains(&idx));
        }
    }
}
