use axum::{
    routing::get,
    Json, Router,
    extract::{State, Query},
};
use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::env;
use json5;
use crate::{
    YEN,
    GameY,
    Movement,
    PlayerId,
    MoveResponse,
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
    next_move: YEN,
}

pub async fn play_handler(
    State(_state): State<AppState>,
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

    let url = format!(
        "{}/{}/ybot/choose/{}",
        env::var("RUST_URL").unwrap_or("http://localhost:4000".into()),
        api_version,
        body.bot_id
    );

    tracing::debug!("URL llamada al módulo Rust: {}", url);

    let client = Client::new();

    let rust_response = client
        .post(url)
        .json(&yen)
        .send()
        .await
        .map_err(|e| {
            tracing::debug!("Error al contactar con el módulo Rust: {}", e);
            Json(ErrorResponse::error(
                &format!("Error contacting Rust module: {}", e),
                Some(api_version.into()),
                Some(body.bot_id.clone()),
            ))
        })?;

    tracing::debug!("Respuesta HTTP del módulo Rust: {:?}", rust_response);

    let text = rust_response
        .text()
        .await
        .map_err(|e| {
            tracing::debug!("Error leyendo body: {}", e);
            Json(ErrorResponse::error(
                &format!("Error reading body: {}", e),
                Some(api_version.into()),
                Some(body.bot_id.clone()),
            ))
        })?;

    tracing::debug!("Body crudo recibido: '{}'", text);

    let parsed: MoveResponse = serde_json::from_str(&text)
        .map_err(|e| {
            tracing::debug!("Error parseando MoveResponse: {} | body fue: '{}'", e, text);
            Json(ErrorResponse::error(
                &format!("Invalid response from Rust module: {}", e),
                Some(api_version.into()),
                Some(body.bot_id.clone()),
            ))
        })?;

    tracing::debug!("MoveResponse parseado: {:?}", parsed);

    // Convertir YEN a GameY para aplicar el movimiento
    let mut game = GameY::try_from(yen.clone())
        .map_err(|e| {
            tracing::debug!("Error convirtiendo YEN a GameY: {}", e);
            Json(ErrorResponse::error(
                &format!("Invalid YEN position: {}", e),
                Some(api_version.into()),
                Some(body.bot_id.clone()),
            ))
        })?;

    // Determinar el jugador actual a partir del turno en el YEN
    let current_player = PlayerId::new(yen.turn());

    // Aplicar el movimiento
    game.add_move(Movement::Placement {
        player: current_player,
        coords: parsed.coords,
    })
    .map_err(|e| {
        tracing::debug!("Error aplicando movimiento: {}", e);
        Json(ErrorResponse::error(
            &format!("Error applying move: {}", e),
            Some(api_version.into()),
            Some(body.bot_id.clone()),
        ))
    })?;

    // Convertir el GameY actualizado de vuelta a YEN
    let next_yen: YEN = (&game).into();

    tracing::debug!("YEN resultante: {:?}", next_yen);

    Ok(Json(PlayResponse {
        next_move: next_yen,
    }))
}

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/play", get(play_handler))
        .with_state(state)
}