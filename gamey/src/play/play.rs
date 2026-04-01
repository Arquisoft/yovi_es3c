use axum::{
    routing::post,
    Json, Router,
    extract::State,
};
use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::env;
use crate::{
    YEN,
    Coordinates,
    MoveResponse,
    ErrorResponse,
    state::AppState,
};

#[derive(Deserialize)]
pub struct PlayRequest {
    position: YEN,
    bot_id: String,
}

#[derive(Serialize)]
pub struct PlayResponse {
    next_move: Coordinates,
}

pub async fn play_handler(
    State(state): State<AppState>,
    Json(body): Json<PlayRequest>,
) -> Result<Json<PlayResponse>, Json<ErrorResponse>> {

    let api_version = "v1";

    // LOG 1: request recibido
    tracing::debug!(
        "PlayRequest recibido: bot_id={}, position={:?}",
        body.bot_id,
        body.position
    );

    let url = format!(
        "{}/{}/ybot/choose/{}",
        env::var("RUST_URL").unwrap_or("http://localhost:4000".into()),
        api_version,
        body.bot_id
    );

    // LOG 2: URL que se va a llamar
    tracing::debug!("URL llamada al módulo Rust: {}", url);

    let client = Client::new();

    let rust_response = client
        .post(url)
        .json(&body.position)
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

    // LOG 3: respuesta HTTP cruda
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

    // LOG 4: MoveResponse parseado
    tracing::debug!("MoveResponse parseado: {:?}", parsed);

    Ok(Json(PlayResponse {
        next_move: parsed.coords,
    }))
}

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/play", post(play_handler))
        .with_state(state)
}
