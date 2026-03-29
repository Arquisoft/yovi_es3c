use axum::{
    routing::post,
    Json, Router,
    extract::{State, Path},
};
use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::env;

#[derive(Deserialize)]
struct PlayRequest {
    position: YEN,
    bot_id: String,
}

#[derive(Serialize)]
struct PlayResponse {
    next_move: Coordinates,
}

async fn play_handler(
    State(state): State<AppState>,
    Json(body): Json<PlayRequest>,
) -> Result<Json<PlayResponse>, Json<ErrorResponse>> {

    let api_version = "v1";

    // Llamamos internamente al mismo endpoint choose.rs
    let url = format!(
        "{}/{}/ybot/choose/{}",
        env::var("RUST_URL").unwrap_or("http://localhost:4000".into()),
        api_version,
        body.bot_id
    );

    let client = Client::new();

    let rust_response = client
        .post(url)
        .json(&body.position)
        .send()
        .await
        .map_err(|e| Json(ErrorResponse::error(
            &format!("Error contacting Rust module: {}", e),
            Some(api_version.into()),
            Some(body.bot_id.clone()),
        )))?;

    let parsed: MoveResponse = rust_response
        .json()
        .await
        .map_err(|e| Json(ErrorResponse::error(
            &format!("Invalid response from Rust module: {}", e),
            Some(api_version.into()),
            Some(body.bot_id.clone()),
        )))?;

    Ok(Json(PlayResponse {
        next_move: parsed.coords,
    }))
}

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/play", post(play_handler))
        .with_state(state)
}
