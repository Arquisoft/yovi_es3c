use axum::{
    routing::get,
    Json, Router,
    extract::{State, Query},
};
use serde::{Deserialize, Serialize};
use json5;
use crate::{
    YEN,
    GameY,
    Coordinates,
    ErrorResponse,
    state::AppState,
};

#[derive(Deserialize)]
pub struct PlayRequest {
    position: String,
    #[serde(default = "default_bot_id")]
    bot_id: String,
     #[serde(default = "default_api_version")]
    api_version: String,
}

fn default_api_version() -> String {
    "v1".to_string()
}

fn default_bot_id() -> String {
    "montecarlo_bot".to_string()
}

#[derive(Serialize)]
pub struct PlayResponse {
    coords: Coordinates,
}

pub async fn play_handler(
    State(state): State<AppState>,
    Query(body): Query<PlayRequest>,
) -> Result<Json<PlayResponse>, Json<ErrorResponse>> {

    let api_version = &body.api_version;

    tracing::debug!(
        "PlayRequest recibido: bot_id={}, position={:?}",
        body.bot_id,
        body.position
    );

    let yen: YEN = json5::from_str(&body.position)
        .map_err(|e| {
            tracing::debug!("Error parseando position: {}", e);
            Json(ErrorResponse::error(
                &format!("Invalid position format: {}", e),
                Some(api_version.into()),
                Some(body.bot_id.clone()),
            ))
        })?;

    // Convertir YEN a GameY
    let game = GameY::try_from(yen.clone())
        .map_err(|e| {
            tracing::debug!("Error convirtiendo YEN a GameY: {}", e);
            Json(ErrorResponse::error(
                &format!("Invalid YEN position: {}", e),
                Some(api_version.into()),
                Some(body.bot_id.clone()),
            ))
        })?;

    // Obtener el bot del registry
    let bot = match state.bots().find(&body.bot_id) {
        Some(bot) => bot,
        None => {
            let available_bots = state.bots().names().join(", ");
            return Err(Json(ErrorResponse::error(
                &format!(
                    "Bot not found: {}, available bots: [{}]",
                    body.bot_id, available_bots
                ),
                Some(api_version.into()),
                Some(body.bot_id.clone()),
            )));
        }
    };

    // Obtener las coordenadas del movimiento del bot
    let coords = match bot.choose_move(&game) {
        Some(coords) => coords,
        None => {
            return Err(Json(ErrorResponse::error(
                "No valid moves available for the bot",
                Some(api_version.into()),
                Some(body.bot_id.clone()),
            )));
        }
    };

    tracing::debug!("Coordenadas seleccionadas por el bot: {:?}", coords);

    Ok(Json(PlayResponse {
        coords,
    }))
}

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/play", get(play_handler))
        .with_state(state)
}