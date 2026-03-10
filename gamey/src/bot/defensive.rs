//! A defensive bot implementation.
//! 
//! This moduel provides [`DefensiveBot`], a bot that tries to block
//! the opponent while also advancing towards the center.

use crate::{Coordinates, Difficulty, GameY, YBot};

/// A bot that chooses moves using a defensive heuristic.
/// 
/// Unlike `HeuristicBot`, this bot also considers opponent pieces
/// nearby, penalizing or prioritizing moves that block the rival.
/// 
/// - "Easy": Block the rival slowly.
/// - "Hard": Blocks the rival with much more agression.

pub struct DefensiveBot {
    pub difficulty: Difficulty,
}

impl DefensiveBot{
    pub fn new(difficulty: Difficulty) -> Self{
        Self {difficulty}
    }

    fn score_move(&self, board: &GameY, coords: Coordinates) -> i32 {
        let size = board.board_size() as i32;
        let cx = (size-1) /2;
        let cy = (size-1) /2;

        let dx = (coords.x() as i32 - cx).abs();
        let dy = (coords.x() as i32 - cy).abs();
        let mut score = 100 - (dx + dy);    // Aquellas casillas más centrales puntúan más.

        // Peso del bloqueo según la dificultad.
        let block_weight = match self.difficulty {
            Difficulty::Easy => 5,
            Difficulty::Hard => 30,
        };

        // Los vecinos ocupados por cualquier jugador se considera una casilla caliente.
        // Si una casilla tiene fichas cerca, sube mucho su puntuación.
        let neighbors = board.get_neighbors(&coords);
        
        // Itera por todos los vecinos contando los que estén ocupados.
        let occupied_neighbors = neighbors.iter().filter(|c|{
            !board.available_cells().contains(&c.to_index(board.board_size()))
        }).count() as i32;

        score += occupied_neighbors * block_weight;

        score    
    }
}

impl YBot for DefensiveBot {
    fn name(&self) -> &str {
        match self.difficulty {
            Difficulty::Easy => "defensivebot-easy",
            Difficulty::Hard => "defensivebot-hard",
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Coordinates, GameY, Movement, PlayerId};

    #[test]
    fn test_defensivebot_name_easy() {
        let bot = DefensiveBot::new(Difficulty::Easy);
        assert_eq!(bot.name(), "defensivebot-easy");
    }

    #[test]
    fn test_defensivebot_name_hard() {
        let bot = DefensiveBot::new(Difficulty::Hard);
        assert_eq!(bot.name(), "defensivebot-hard");
    }

    #[test]
    fn test_defensivebot_returns_move_on_empty_board() {
        let bot = DefensiveBot::new(Difficulty::Hard);
        let game = GameY::new(5);
        assert!(bot.choose_move(&game).is_some());
    }

    #[test]
    fn test_defensivebot_returns_none_on_full_board() {
        let bot = DefensiveBot::new(Difficulty::Easy);
        let mut game = GameY::new(1);
        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(0, 0, 0),
        })
        .unwrap();
        assert!(bot.choose_move(&game).is_none());
    }

    #[test]
    fn test_defensivebot_returns_valid_cell() {
        let bot = DefensiveBot::new(Difficulty::Hard);
        let game = GameY::new(5);
        let coords = bot.choose_move(&game).unwrap();
        let idx = coords.to_index(game.board_size());
        assert!(game.available_cells().contains(&idx));
    }

    #[test]
    fn test_defensivebot_prefers_occupied_neighbors() {
        let bot = DefensiveBot::new(Difficulty::Hard);
        let mut game = GameY::new(5);
        // Colocamos una ficha rival cerca del centro
        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(2, 1, 1),
        })
        .unwrap();
        // El bot debería devolver una jugada válida
        assert!(bot.choose_move(&game).is_some());
    }
}