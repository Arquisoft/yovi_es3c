use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use gamey::{YBotRegistry, YEN, create_default_state, create_router, state::AppState, RandomBot, MoveResponse, ErrorResponse};
use http_body_util::BodyExt;
use std::sync::Arc;
use tower::ServiceExt;
use gamey::init_tracing;

use httpmock::{MockServer, Method::POST};
use serde_json::Value;
use std::sync::Mutex;

static TEST_MUTEX: Mutex<()> = Mutex::new(());


/// Helper to create a test app with the default state
fn test_app() -> axum::Router {
    create_router(create_default_state())
}

/// Helper to create a test app with a custom state
fn test_app_with_state(state: AppState) -> axum::Router {
    create_router(state)
}

// ============================================================================
// Status endpoint tests
// ============================================================================

#[tokio::test]
async fn test_status_endpoint_returns_ok() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/status")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    assert_eq!(&body[..], b"OK");
}



// ============================================================================
// Choose endpoint tests - Success cases
// ============================================================================

#[tokio::test]
async fn test_choose_endpoint_with_valid_request() {
    let app = test_app();

    // Create a valid YEN (Y-game Exchange Notation) for a size 3 board
    // Layout: empty board with 3 rows (size 3): row1=1cell, row2=2cells, row3=3cells
    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let move_response: MoveResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(move_response.api_version, "v1");
    assert_eq!(move_response.bot_id, "random_bot");
    // Coordinates should be valid (we can't predict exactly which one the random bot picks)
}

#[tokio::test]
async fn test_choose_endpoint_with_partially_filled_board() {
    let app = test_app();

    // Board with some cells already filled: B in first cell, R in second
    let yen = YEN::new(3, 2, vec!['B', 'R'], "B/R./.B.".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let move_response: MoveResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(move_response.api_version, "v1");
    assert_eq!(move_response.bot_id, "random_bot");
}

// ============================================================================
// Choose endpoint tests - Error cases
// ============================================================================

#[tokio::test]
async fn test_choose_endpoint_with_invalid_api_version() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v2/ybot/choose/random_bot") // v2 is not supported
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK); // Axum returns 200 with error JSON

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let error_response: ErrorResponse = serde_json::from_slice(&body).unwrap();

    assert!(error_response.message.contains("Unsupported API version"));
    assert_eq!(error_response.api_version, Some("v2".to_string()));
}

#[tokio::test]
async fn test_choose_endpoint_with_unknown_bot() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/unknown_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let error_response: ErrorResponse = serde_json::from_slice(&body).unwrap();

    assert!(error_response.message.contains("Bot not found"));
    assert!(error_response.message.contains("unknown_bot"));
    assert_eq!(error_response.bot_id, Some("unknown_bot".to_string()));
}

#[tokio::test]
async fn test_choose_endpoint_with_invalid_json() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from("{ invalid json }"))
                .unwrap(),
        )
        .await
        .unwrap();

    // Invalid JSON should return a 4xx error
    assert!(response.status().is_client_error());
}

#[tokio::test]
async fn test_choose_endpoint_with_missing_content_type() {
    let app = test_app();

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                // No content-type header
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    // Missing content-type should return an error
    assert!(response.status().is_client_error());
}

// ============================================================================
// Custom state tests
// ============================================================================

#[tokio::test]
async fn test_choose_with_custom_bot_registry() {
    // Create a custom registry with only the random bot
    let bots = YBotRegistry::new().with_bot(Arc::new(RandomBot));
    let state = AppState::new(bots);
    let app = test_app_with_state(state);

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_choose_with_empty_bot_registry() {
    // Create an empty registry
    let bots = YBotRegistry::new();
    let state = AppState::new(bots);
    let app = test_app_with_state(state);

    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/random_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let error_response: ErrorResponse = serde_json::from_slice(&body).unwrap();

    assert!(error_response.message.contains("Bot not found"));
}

// ============================================================================
// Route not found tests
// ============================================================================

#[tokio::test]
async fn test_unknown_route_returns_404() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/unknown/route")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_wrong_method_on_status_endpoint() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/status")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    // POST to a GET-only endpoint should return 405 Method Not Allowed
    assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
}

#[tokio::test]
async fn test_get_on_choose_endpoint_returns_method_not_allowed() {
    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/v1/ybot/choose/random_bot")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
}

// Tests de integración para heuristic_bot
#[tokio::test]
async fn test_choose_heuristic_bot() {
    let app = test_app();
    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/heuristic_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let body_str = String::from_utf8(body.to_vec()).unwrap();
    assert!(body_str.contains("heuristic_bot"));
}

// Test de integración para defensive_bot
#[tokio::test]
async fn test_choose_defensive_bot() {
    let app = test_app();
    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/defensive_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let body_str = String::from_utf8(body.to_vec()).unwrap();
    assert!(body_str.contains("defensive_bot"));
}

// Test de integración para montecarlo_bot
#[tokio::test]
async fn test_choose_montecarlo_bot() {
    let app = test_app();
    let yen = YEN::new(3, 0, vec!['B', 'R'], "./../...".to_string());
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/ybot/choose/montecarlo_bot")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&yen).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let body_str = String::from_utf8(body.to_vec()).unwrap();
    assert!(body_str.contains("montecarlo_bot"));
}

// ============================================================================
// Play endpoint tests
// ============================================================================


#[tokio::test]
async fn test_play_endpoint_returns_next_move() {
    let _lock = TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner());
    crate::init_tracing();

    let server = MockServer::start();

    unsafe {
        std::env::set_var("RUST_URL", server.base_url());
    }

    let app = test_app();

    let _mock = server.mock(|when: httpmock::When, then: httpmock::Then| {
        when.method(POST)
            .path("/v1/ybot/choose/random_bot");
        then.status(200)
            .header("content-type", "application/json")
            .body(
                serde_json::to_string(&serde_json::json!({
                    "api_version": "v1",
                    "bot_id": "random_bot",
                    "coords": { "x": 1, "y": 2, "z": 0 }
                })).unwrap()
            );
    });

    let yen = YEN::new(4, 0, vec!['B', 'R'], "./../.../....".to_string());

    let body = serde_json::json!({
        "position": yen,
        "bot_id": "random_bot"
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), axum::http::StatusCode::OK);

    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let json: Value = serde_json::from_slice(&bytes).unwrap();

    let next_move = json.get("next_move").unwrap();
    assert!(next_move.get("size").is_some());
    assert!(next_move.get("turn").is_some());
    assert!(next_move.get("players").is_some());
    assert!(next_move.get("layout").is_some());
    assert_eq!(next_move.get("turn").unwrap(), 1);
    assert_ne!(next_move.get("layout").unwrap(), "./../.../....");
}

#[tokio::test]
async fn test_play_endpoint_default_bot_id() {
    let _lock = TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner());
    crate::init_tracing();

    let server = MockServer::start();

    unsafe {
        std::env::set_var("RUST_URL", server.base_url());
    }

    let app = test_app();

    let _mock = server.mock(|when: httpmock::When, then: httpmock::Then| {
        when.method(POST)
            .path("/v1/ybot/choose/montecarlo_bot");
        then.status(200)
            .header("content-type", "application/json")
            .body(
                serde_json::to_string(&serde_json::json!({
                    "api_version": "v1",
                    "bot_id": "montecarlo_bot",
                    "coords": { "x": 1, "y": 2, "z": 0 }
                })).unwrap()
            );
    });

    let yen = YEN::new(4, 0, vec!['B', 'R'], "./../.../....".to_string());

    let body = serde_json::json!({
        "position": yen
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), axum::http::StatusCode::OK);

    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let json: Value = serde_json::from_slice(&bytes).unwrap();

    let next_move = json.get("next_move").unwrap();
    assert!(next_move.get("size").is_some());
    assert!(next_move.get("turn").is_some());
    assert!(next_move.get("players").is_some());
    assert!(next_move.get("layout").is_some());
    assert_eq!(next_move.get("turn").unwrap(), 1);
    assert_ne!(next_move.get("layout").unwrap(), "./../.../....");
}

#[tokio::test]
async fn test_play_endpoint_rust_module_unreachable() {
    let _lock = TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner());
    crate::init_tracing();

    unsafe {
        std::env::set_var("RUST_URL", "http://127.0.0.1:19999");
    }

    let app = test_app();

    let yen = YEN::new(4, 0, vec!['B', 'R'], "./../.../....".to_string());

    let body = serde_json::json!({
        "position": yen,
        "bot_id": "random_bot"
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), axum::http::StatusCode::OK);

    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let json: Value = serde_json::from_slice(&bytes).unwrap();
    assert!(json.get("message").is_some());
}

#[tokio::test]
async fn test_play_endpoint_invalid_json_from_rust_module() {
    let _lock = TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner());
    crate::init_tracing();

    let server = MockServer::start();

    unsafe {
        std::env::set_var("RUST_URL", server.base_url());
    }

    let app = test_app();

    let _mock = server.mock(|when: httpmock::When, then: httpmock::Then| {
        when.method(POST)
            .path("/v1/ybot/choose/random_bot");
        then.status(200)
            .header("content-type", "application/json")
            .body("{ invalid json }");
    });

    let yen = YEN::new(4, 0, vec!['B', 'R'], "./../.../....".to_string());

    let body = serde_json::json!({
        "position": yen,
        "bot_id": "random_bot"
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), axum::http::StatusCode::OK);

    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let json: Value = serde_json::from_slice(&bytes).unwrap();
    assert!(json.get("message").is_some());
}

#[tokio::test]
async fn test_play_endpoint_invalid_yen_position() {
    let _lock = TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner());
    crate::init_tracing();

    let server = MockServer::start();

    unsafe {
        std::env::set_var("RUST_URL", server.base_url());
    }

    let app = test_app();

    let _mock = server.mock(|when: httpmock::When, then: httpmock::Then| {
        when.method(POST)
            .path("/v1/ybot/choose/random_bot");
        then.status(200)
            .header("content-type", "application/json")
            .body(
                serde_json::to_string(&serde_json::json!({
                    "api_version": "v1",
                    "bot_id": "random_bot",
                    "coords": { "x": 1, "y": 2, "z": 0 }
                })).unwrap()
            );
    });

    let body = serde_json::json!({
        "position": {
            "size": 4,
            "turn": 0,
            "players": ["B", "R"],
            "layout": "./..."
        },
        "bot_id": "random_bot"
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), axum::http::StatusCode::OK);

    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let json: Value = serde_json::from_slice(&bytes).unwrap();
    assert!(json.get("message").is_some());
}

#[tokio::test]
async fn test_play_endpoint_occupied_cell() {
    let _lock = TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner());
    crate::init_tracing();

    let server = MockServer::start();

    unsafe {
        std::env::set_var("RUST_URL", server.base_url());
    }

    let app = test_app();

    let _mock = server.mock(|when: httpmock::When, then: httpmock::Then| {
        when.method(POST)
            .path("/v1/ybot/choose/random_bot");
        then.status(200)
            .header("content-type", "application/json")
            .body(
                serde_json::to_string(&serde_json::json!({
                    "api_version": "v1",
                    "bot_id": "random_bot",
                    "coords": { "x": 2, "y": 0, "z": 0 }
                })).unwrap()
            );
    });

    let yen = YEN::new(3, 1, vec!['B', 'R'], "B/../...".to_string());

    let body = serde_json::json!({
        "position": yen,
        "bot_id": "random_bot"
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), axum::http::StatusCode::OK);

    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let json: Value = serde_json::from_slice(&bytes).unwrap();
    assert!(json.get("message").is_some());
}

#[tokio::test]
async fn test_play_endpoint_invalid_json_body() {
    let _lock = TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner());
    crate::init_tracing();

    let app = test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/play")
                .header("content-type", "application/json")
                .body(Body::from("{ invalid json }"))
                .unwrap(),
        )
        .await
        .unwrap();

    assert!(response.status().is_client_error());
}


// Comprueba que el estado por defecto tiene todos los bots registrados
#[tokio::test]
async fn test_default_state_has_all_bots() {
    let state = create_default_state();
    let bots = state.bots();
    let names = bots.names();
    assert!(names.iter().any(|n| n == "random_bot"));
    assert!(names.iter().any(|n| n == "heuristic_bot"));
    assert!(names.iter().any(|n| n == "defensive_bot"));
    assert!(names.iter().any(|n| n == "montecarlo_bot"));
}




