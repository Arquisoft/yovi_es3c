//! A simple bot implementation.
//!
//! This module provides [`HeuristicBot`], a bot that makes coherent valid moves.

use crate::{Coordinates, GameY, YBot};
use rand::prelude::IndexedRandom;

/// A bot that chooses moves using a simple heuristic.
///
/// Unlike `RandomBot`, this bot tries to pick a move that "makes sense"
/// according to a scoring function (e.g., preferring central positions).
/// Ties are broken randomly to avoid directional bias.
///
/// # Example
///
/// ```
/// use gamey::{GameY, HeuristicBot, YBot};
///
/// let bot = HeuristicBot;
/// let game = GameY::new(5);
///
/// // The bot will always return Some when there are available moves
/// let chosen_move = bot.choose_move(&game);
/// assert!(chosen_move.is_some());
/// ```
pub struct HeuristicBot;

impl HeuristicBot {
    fn score_move(board: &GameY, coords: Coordinates) -> i32 {
        let size = board.board_size() as i32;
        let cx = (size - 1) / 2;
        let cy = (size - 1) / 2;

        let dx = (coords.x() as i32 - cx).abs();
        let dy = (coords.y() as i32 - cy).abs();
        let dist_center = dx + dy;

        let mut score = 100 - dist_center;

        if coords.x() == 0
            || coords.y() == 0
            || coords.x() as i32 == size - 1
            || coords.y() as i32 == size - 1
        {
            score -= 10;
        }

        score
    }
}

impl YBot for HeuristicBot {
    fn name(&self) -> &str {
        "heuristic_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available = board.available_cells();
        let mut best_score = i32::MIN;
        let mut best_candidates: Vec<Coordinates> = Vec::new();

        for idx in available {
            let coords = Coordinates::from_index(*idx, board.board_size());
            let sc = Self::score_move(board, coords);
            if sc > best_score {
                best_score = sc;
                best_candidates.clear();
                best_candidates.push(coords);
            } else if sc == best_score {
                best_candidates.push(coords); // empate: guarda todos
            }
        }

        // Elige aleatoriamente entre los empatados para evitar sesgo
        best_candidates.choose(&mut rand::rng()).copied()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Coordinates, GameY, Movement, PlayerId};

    #[test]
    fn test_heuristicbot_name() {
        let bot = HeuristicBot;
        assert_eq!(bot.name(), "heuristic_bot");
    }

    #[test]
    fn test_heuristicbot_returns_move_on_empty_board() {
        let bot = HeuristicBot;
        let game = GameY::new(5);
        assert!(bot.choose_move(&game).is_some());
    }

    #[test]
    fn test_heuristicbot_returns_none_on_full_board() {
        let bot = HeuristicBot;
        let mut game = GameY::new(1);
        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(0, 0, 0),
        }).unwrap();
        assert!(bot.choose_move(&game).is_none());
    }

    #[test]
    fn test_heuristicbot_prefers_center() {
        let bot = HeuristicBot;
        let game = GameY::new(5);
        let coords = bot.choose_move(&game).unwrap();
        assert!(coords.x() > 0 && coords.y() > 0);
    }

    #[test]
    fn test_heuristicbot_returns_valid_cell() {
        let bot = HeuristicBot;
        let game = GameY::new(5);
        let coords = bot.choose_move(&game).unwrap();
        let idx = coords.to_index(game.board_size());
        assert!(game.available_cells().contains(&idx));
    }
}
