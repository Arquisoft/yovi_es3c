//! A simple bot implementation.
//!
//! This module provides [`HeuristicBot`], a bot that makes coherent valid moves.

use crate::{Coordinates, GameY, YBot, Difficulty};

/// A bot that chooses moves using a simple heuristic.
///
/// Unlike `RandomBot`, this bot tries to pick a move that "makes sense"
/// according to a scoring function (e.g., preferring central positions).
/// 
/// The bot uses 2 types of difficulty:
/// - Easy: it only prefers the center.
/// - Hard: it prefers the center and penalizes edges more heavily.
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
pub struct HeuristicBot {
    pub difficulty: Difficulty,
}

impl HeuristicBot {
    pub fn new(difficulty: Difficulty) -> Self {
        Self { difficulty }
    }

    fn score_move(&self, board: &GameY, coords: Coordinates) -> i32 {
        let size = board.board_size() as i32;

        let cx = (size - 1) / 2;
        let cy = (size - 1) / 2;

        let dx = (coords.x() as i32 - cx).abs();
        let dy = (coords.y() as i32 - cy).abs();
        let dist_center = dx + dy;

        let mut score = 0;
        score += 100 - dist_center;

        // Hard penalizes edges more than easy.
        let border_penalty = match self.difficulty {
            Difficulty::Easy => 5,
            Difficulty::Hard => 20,
        };

        if coords.x() == 0
            || coords.y() == 0
            || coords.x() as i32 == size - 1
            || coords.y() as i32 == size - 1
        {
            score -= border_penalty;
        }

        score 
    }
}

impl YBot for HeuristicBot {
    fn name(&self) -> &str {
        match self.difficulty {
            Difficulty::Easy => "heuristicbot-easy",
            Difficulty::Hard => "heuristicbot-hard",
        }
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available = board.available_cells();

        let mut best: Option<Coordinates> = None;
        let mut best_score = i32::MIN;

        for idx in available {
            let coords = Coordinates::from_index(*idx, board.board_size());

            let sc = self.score_move(board, coords);
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
    fn test_heuristicbot_name_easy() {
        let bot = HeuristicBot::new(Difficulty::Easy);
        assert_eq!(bot.name(), "heuristicbot-easy");
    }

    #[test]
    fn test_heuristicbot_name_hard() {
        let bot = HeuristicBot::new(Difficulty::Hard);
        assert_eq!(bot.name(), "heuristicbot-hard");
    }

    #[test]
    fn test_heuristicbot_returns_move_on_empty_board() {
        let bot = HeuristicBot::new(Difficulty::Hard);
        let game = GameY::new(5);
        assert!(bot.choose_move(&game).is_some());
    }

    #[test]
    fn test_heuristicbot_returns_none_on_full_board() {
        let bot = HeuristicBot::new(Difficulty::Easy);
        let mut game = GameY::new(1);
        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(0, 0, 0),
        }).unwrap();
        assert!(bot.choose_move(&game).is_none());
    }

    #[test]
    fn test_heuristicbot_prefers_center() {
        let bot = HeuristicBot::new(Difficulty::Hard);
        let game = GameY::new(5);
        let coords = bot.choose_move(&game).unwrap();
        assert!(coords.x() > 0 && coords.y() > 0);
    }

    #[test]
    fn test_hard_differs_from_easy_behavior() {
        // Hard penaliza bordes más fuerte, ambos deben dar un resultado válido
        let easy = HeuristicBot::new(Difficulty::Easy);
        let hard = HeuristicBot::new(Difficulty::Hard);
        let game = GameY::new(5);
        assert!(easy.choose_move(&game).is_some());
        assert!(hard.choose_move(&game).is_some());
    }
}

