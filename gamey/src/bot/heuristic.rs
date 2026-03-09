//! A simple bot implementation.
//!
//! This module provides [`HeuristicBot`], a bot that makes coherent valid moves.

use crate::{Coordinates, GameY, YBot};

/// A bot that chooses moves using a simple heuristic.
///
/// Unlike `RandomBot`, this bot tries to pick a move that "makes sense"
/// according to a scoring function (e.g., preferring central positions).
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

        let mut score = 0;
        score += 100 - dist_center;

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
        "heuristicbot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available = board.available_cells();

        let mut best: Option<Coordinates> = None;
        let mut best_score = i32::MIN;

        for idx in available {
            let coords = Coordinates::from_index(*idx, board.board_size());

            let sc = Self::score_move(board, coords);
            if sc > best_score {
                best_score = sc;
                best = Some(coords);
            }
        }

        best  
    }
}

/// Test

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{GameY, Movement, PlayerId, Coordinates};

    #[test]
    fn test_heuristicbot_name() {
        let bot = HeuristicBot;
        assert_eq!(bot.name(), "heuristicbot");
    }

    #[test]
    fn test_heuristicbot_returns_move_on_empty_board() {
        let bot = HeuristicBot;
        let game = GameY::new(5);
        let chosen_move = bot.choose_move(&game);
        assert!(chosen_move.is_some());
    }

    #[test]
    fn test_heuristicbot_returns_none_on_full_board() {
        let bot = HeuristicBot;
        // Tablero mínimo de tamaño 1 (solo 1 casilla)
        let mut game = GameY::new(1);
        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(0, 0, 0),
        }).unwrap();
        // Tablero lleno → debe devolver None
        assert!(bot.choose_move(&game).is_none());
    }

    #[test]
    fn test_heuristicbot_prefers_center() {
        let bot = HeuristicBot;
        let game = GameY::new(5);
        let coords = bot.choose_move(&game).unwrap();
        // En un tablero de 5, el centro es (2,2,0) o similar.
        // Al menos no debería elegir una esquina (x=4 o y=0, etc.)
        assert!(coords.x() > 0 && coords.y() > 0);
    }

    #[test]
    fn test_heuristicbot_returns_valid_cell() {
        let bot = HeuristicBot;
        let game = GameY::new(5);
        let coords = bot.choose_move(&game).unwrap();
        let idx = coords.to_index(game.board_size());
        // El índice debe estar dentro del rango válido
        assert!(game.available_cells().contains(&idx));
    }
}
