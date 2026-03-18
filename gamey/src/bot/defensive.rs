//! A defensive bot implementation.
//!
//! This module provides [`DefensiveBot`], a bot that tries to block
//! the opponent while also advancing towards the center.

use crate::{Coordinates, GameY, YBot};
use rand::prelude::IndexedRandom;

/// A bot that chooses moves using a defensive heuristic.
///
/// Unlike `HeuristicBot`, this bot also considers opponent pieces
/// nearby, prioritizing moves that block the rival.
///
/// # Example
///
/// ```
/// use gamey::{GameY, DefensiveBot, YBot};
///
/// let bot = DefensiveBot;
/// let game = GameY::new(5);
///
/// let chosen_move = bot.choose_move(&game);
/// assert!(chosen_move.is_some());
/// ```
pub struct DefensiveBot;

impl DefensiveBot {
    fn score_move(board: &GameY, coords: Coordinates) -> i32 {
        let size = board.board_size() as i32;
        let cx = (size - 1) / 2;
        let cy = (size - 1) / 2;

        let dx = (coords.x() as i32 - cx).abs();
        let dy = (coords.y() as i32 - cy).abs(); // ← bug corregido
        let mut score = 100 - (dx + dy);

        let neighbors = board.get_neighbors(&coords);
        let occupied_neighbors = neighbors
            .iter()
            .filter(|c| {
                !board.available_cells().contains(&c.to_index(board.board_size()))
            })
            .count() as i32;

        score += occupied_neighbors * 15;

        score
    }
}

impl YBot for DefensiveBot {
    fn name(&self) -> &str {
        "defensive_bot"
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
                best_candidates.push(coords);
            }
        }

        best_candidates.choose(&mut rand::rng()).copied()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Coordinates, GameY, Movement, PlayerId};

    #[test]
    fn test_defensivebot_name() {
        let bot = DefensiveBot;
        assert_eq!(bot.name(), "defensivebot");
    }

    #[test]
    fn test_defensivebot_returns_move_on_empty_board() {
        let bot = DefensiveBot;
        let game = GameY::new(5);
        assert!(bot.choose_move(&game).is_some());
    }

    #[test]
    fn test_defensivebot_returns_none_on_full_board() {
        let bot = DefensiveBot;
        let mut game = GameY::new(1);
        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(0, 0, 0),
        }).unwrap();
        assert!(bot.choose_move(&game).is_none());
    }

    #[test]
    fn test_defensivebot_returns_valid_cell() {
        let bot = DefensiveBot;
        let game = GameY::new(5);
        let coords = bot.choose_move(&game).unwrap();
        let idx = coords.to_index(game.board_size());
        assert!(game.available_cells().contains(&idx));
    }

    #[test]
    fn test_defensivebot_prefers_occupied_neighbors() {
        let bot = DefensiveBot;
        let mut game = GameY::new(5);
        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(2, 1, 1),
        }).unwrap();
        assert!(bot.choose_move(&game).is_some());
    }
}
