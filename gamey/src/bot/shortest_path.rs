use std::cmp::Reverse;
use std::collections::BinaryHeap;

use crate::core::game::Cell;
use crate::{Coordinates, GameY, Movement, PlayerId, YBot};
use rand::prelude::IndexedRandom;

pub struct ShortestPathBot;

impl ShortestPathBot {
    fn cell_cost(board: &GameY, coords: &Coordinates, player: PlayerId) -> u32 {
        match board.cell_at(coords) {
            Cell::Occupied(p) if p == player => 0,
            Cell::Empty => 1,
            _ => u32::MAX,
        }
    }

    fn dijkstra_from_side(
        board: &GameY,
        player: PlayerId,
        is_side: fn(&Coordinates) -> bool,
    ) -> Vec<u32> {
        let size = board.board_size();
        let total = board.total_cells() as usize;
        let mut dist = vec![u32::MAX; total];
        let mut heap = BinaryHeap::new();

        for idx in 0..total as u32 {
            let coords = Coordinates::from_index(idx, size);
            if is_side(&coords) {
                let cost = Self::cell_cost(board, &coords, player);
                if cost < u32::MAX && cost < dist[idx as usize] {
                    dist[idx as usize] = cost;
                    heap.push(Reverse((cost, idx)));
                }
            }
        }

        while let Some(Reverse((d, idx))) = heap.pop() {
            if d > dist[idx as usize] {
                continue;
            }
            let coords = Coordinates::from_index(idx, size);
            for neighbor in board.get_neighbors(&coords) {
                let n_idx = neighbor.to_index(size) as usize;
                let n_cost = Self::cell_cost(board, &neighbor, player);
                if n_cost < u32::MAX {
                    let new_dist = d.saturating_add(n_cost);
                    if new_dist < dist[n_idx] {
                        dist[n_idx] = new_dist;
                        heap.push(Reverse((new_dist, n_idx as u32)));
                    }
                }
            }
        }

        dist
    }

    fn connection_cost(board: &GameY, player: PlayerId) -> u32 {
        let dist_a = Self::dijkstra_from_side(board, player, Coordinates::touches_side_a);
        let dist_b = Self::dijkstra_from_side(board, player, Coordinates::touches_side_b);
        let dist_c = Self::dijkstra_from_side(board, player, Coordinates::touches_side_c);

        let size = board.board_size();
        let total = board.total_cells() as usize;
        let mut min_cost = u32::MAX;

        for i in 0..total {
            if dist_a[i] < u32::MAX && dist_b[i] < u32::MAX && dist_c[i] < u32::MAX {
                let coords = Coordinates::from_index(i as u32, size);
                let own_cost = Self::cell_cost(board, &coords, player);
                 let cost_u64 = dist_a[i] as u64
                    + dist_b[i] as u64
                    + dist_c[i] as u64
                    - 2 * own_cost as u64;
                let cost = if cost_u64 > u32::MAX as u64 {
                    u32::MAX
                } else {
                    cost_u64 as u32
                };
                min_cost = min_cost.min(cost);
            }
        }

        min_cost
    }

    fn other_player(player: PlayerId) -> PlayerId {
        if player.id() == 0 {
            PlayerId::new(1)
        } else {
            PlayerId::new(0)
        }
    }

    fn evaluate_move(board: &GameY, coords: Coordinates, player: PlayerId) -> i32 {
        let mut game = board.clone();
        let movement = Movement::Placement { player, coords };
        if game.add_move(movement).is_err() {
            return i32::MIN;
        }

        if game.check_game_over() {
            return i32::MAX;
        }

        let opponent = Self::other_player(player);
        let my_cost = Self::connection_cost(&game, player);
        let opp_cost = Self::connection_cost(&game, opponent);

        if my_cost == u32::MAX {
            return i32::MIN + 1;
        }
        if opp_cost == u32::MAX {
            return i32::MAX - 1;
        }

        opp_cost as i32 - my_cost as i32
    }
}

impl YBot for ShortestPathBot {
    fn name(&self) -> &str {
        "shortest_path_bot"
    }

    fn choose_move(&self, board: &GameY) -> Option<Coordinates> {
        let available = board.available_cells();
        if available.is_empty() {
            return None;
        }

        let current_player = board.next_player()?;
        let mut best_score = i32::MIN;
        let mut best_candidates: Vec<Coordinates> = Vec::new();

        for idx in available {
            let coords = Coordinates::from_index(*idx, board.board_size());
            let score = Self::evaluate_move(board, coords, current_player);

            if score > best_score {
                best_score = score;
                best_candidates.clear();
                best_candidates.push(coords);
            } else if score == best_score {
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
    fn test_shortest_path_bot_name() {
        let bot = ShortestPathBot;
        assert_eq!(bot.name(), "shortest_path_bot");
    }

    #[test]
    fn test_shortest_path_bot_returns_move_on_empty_board() {
        let bot = ShortestPathBot;
        let game = GameY::new(5);
        assert!(bot.choose_move(&game).is_some());
    }

    #[test]
    fn test_shortest_path_bot_returns_none_on_full_board() {
        let bot = ShortestPathBot;
        let mut game = GameY::new(1);
        game.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(0, 0, 0),
        }).unwrap();
        assert!(bot.choose_move(&game).is_none());
    }

    #[test]
    fn test_shortest_path_bot_returns_valid_cell() {
        let bot = ShortestPathBot;
        let game = GameY::new(5);
        let coords = bot.choose_move(&game).unwrap();
        let idx = coords.to_index(game.board_size());
        assert!(game.available_cells().contains(&idx));
    }

    #[test]
    fn test_shortest_path_bot_chooses_winning_move() {
        let bot = ShortestPathBot;
        let p0 = PlayerId::new(0);
        let p1 = PlayerId::new(1);
        // Tablero tamaño 3: 6 celdas. Colocamos 4 (2 por jugador), quedan 2 libres.
        let mut game = GameY::new(3);
        game.add_move(Movement::Placement { player: p0, coords: Coordinates::new(0, 2, 0) }).unwrap();
        game.add_move(Movement::Placement { player: p1, coords: Coordinates::new(0, 0, 2) }).unwrap();
        game.add_move(Movement::Placement { player: p0, coords: Coordinates::new(1, 1, 0) }).unwrap();
        game.add_move(Movement::Placement { player: p1, coords: Coordinates::new(2, 0, 0) }).unwrap();
        let coords = bot.choose_move(&game).unwrap();
        let mut verify = game.clone();
        verify.add_move(Movement::Placement { player: p0, coords }).unwrap();
        assert!(verify.check_game_over(), "La jugada elegida debería ganar la partida");
    }

    #[test]
    fn test_shortest_path_bot_works_on_large_board() {
        let bot = ShortestPathBot;
        let game = GameY::new(16);
        let coords = bot.choose_move(&game);
        assert!(coords.is_some());
        let idx = coords.unwrap().to_index(game.board_size());
        assert!(game.available_cells().contains(&idx));
    }

    #[test]
    fn test_connection_cost_decreases_with_own_pieces() {
        let game_empty = GameY::new(5);
        let cost_empty = ShortestPathBot::connection_cost(&game_empty, PlayerId::new(0));

        let mut game_with_piece = GameY::new(5);
        game_with_piece.add_move(Movement::Placement {
            player: PlayerId::new(0),
            coords: Coordinates::new(2, 1, 1),
        }).unwrap();
        let cost_with = ShortestPathBot::connection_cost(&game_with_piece, PlayerId::new(0));

        assert!(cost_with <= cost_empty);
    }
}
