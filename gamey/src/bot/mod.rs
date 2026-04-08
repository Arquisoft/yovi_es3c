//! Bot module for the Game of Y.
//!
//! - [`YBot`] - Trait que define la interfaz para todos los bots
//! - [`YBotRegistry`] - Registro para gestionar múltiples bots
//! - [`RandomBot`] - Bot aleatorio
//! - [`HeuristicBot`] - Bot heurístico (prefiere el centro)
//! - [`DefensiveBot`] - Bot defensivo (bloquea al rival)
//! - [`MonteCarloBot`] - Bot con simulaciones de Monte Carlo

pub mod random;
pub mod heuristic;
pub mod defensive;
pub mod montecarlo;
pub mod shortest_path;
pub mod ybot;
pub mod ybot_registry;

pub use random::*;
pub use heuristic::*;
pub use defensive::*;
pub use montecarlo::*;
pub use shortest_path::*;
pub use ybot::*;
pub use ybot_registry::*;
