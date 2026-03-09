use crate::{GameY, YEN, check_api_version, error::ErrorResponse };
use axum::{
    Json,
    extract::{Path},
};
use serde::{Deserialize, Serialize};

/// Response que indica el estado del juego
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GameStatusResponse {
    pub api_version: String,
    pub status: String, // "ongoing", "finished"
    pub winner: Option<u32>, // índice del ganador si ha terminado
}

/// Handler para validar un estado de juego y retornar su status
pub async fn validate_game(
    Path(api_version): Path<String>,
    Json(yen): Json<YEN>,
) -> Result<Json<GameStatusResponse>, Json<ErrorResponse>> {
    check_api_version(&api_version)?;
    
    let game = match GameY::try_from(yen) {
        Ok(game) => game,
        Err(err) => {
            return Err(Json(ErrorResponse::error(
                &format!("Invalid YEN format: {}", err),
                Some(api_version),
                None,
            )));
        }
    };
    
    let (status, winner) = match game.status() {
        crate::core::game::GameStatus::Ongoing { .. } => ("ongoing".to_string(), None),
        crate::core::game::GameStatus::Finished { winner } => {
            ("finished".to_string(), Some(winner.id()))
        }
    };
    
    let response = GameStatusResponse {
        api_version,
        status,
        winner,
    };
    
    Ok(Json(response))
}
