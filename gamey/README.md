# Gamey

A Rust implementation of the Game of Y - a strategic board game engine with multiple play modes and bot integration.

## 🚀 Getting Started

### Prerequisites

- Rust 1.70+ (install from [rustup.rs](https://rustup.rs/))
- Cargo (comes with Rust)

## 📝 Available Commands

### `cargo build`

Compiles the project in debug mode:

```sh
cargo build
```

For a release build with optimizations:

```sh
cargo build --release
```

### `cargo run`

Runs the game. Supports three modes:

```sh
# Play human vs human 
cargo run

# Run as HTTP server on port 4000
cargo run -- --mode server --port 4000
```

### `cargo test`

Runs the unit tests:

```sh
cargo test
```

Test files:
- `tests/bot_server_tests.rs` - Server API tests
- `tests/cli_tests.rs` - CLI functionality tests
- `tests/core_tests.rs` - Core game logic tests

### `cargo bench`

Runs performance benchmarks using Criterion:

```sh
cargo bench
```

Generates HTML reports in `target/criterion/`.

## 🏗️ Project Structure

- **src/main.rs** - Entry point for the binary
- **src/lib.rs** - Library entry point
- **src/cli.rs** - Command-line interface and argument parsing
- **src/core/** - Core game logic (board, moves, rules)
- **src/bot/** - Bot implementations (random, heuristic, monte carlo, etc.)
- **src/bot_server/** - HTTP server implementation for bot API
- **src/notation/** - Game notation parsing (YEN format)
- **src/play/** - Game play orchestration
- **src/gamey_error.rs** - Error handling
- **tests/** - Integration tests
- **benches/** - Performance benchmarks

## 🎮 Server 
Run as an HTTP API server:

```sh
cargo run --mode server --port 4000
```

The server provides endpoints for bot operations and game state management. Used by the webapp for gameplay integration.

## 🧪 Testing

### Unit Tests
```sh
cargo test
```

### Integration Tests
```sh
cargo test --test "*"
```

### Fuzz Testing
Requires nightly Rust:

```sh
rustup install nightly
cargo +nightly install cargo-fuzz
cargo +nightly fuzz run fuzz_yen_deserialize
cargo +nightly fuzz run fuzz_coordinates
```

## 📦 Dependencies

**Main:**
- `axum` - Web framework for HTTP server
- `tokio` - Async runtime
- `clap` - CLI argument parsing
- `serde` - Serialization/deserialization
- `rand` - Random number generation
- `tracing` - Logging and diagnostics

**Development:**
- `criterion` - Benchmarking
- `proptest` - Property-based testing
- `httpmock` - HTTP mocking for tests

## 🐳 Docker

The application can be containerized:

```bash
docker build -t gamey .
docker run -p 4000:4000 gamey --mode server --port 4000
```

See [Dockerfile](./Dockerfile) for details.

## 📚 Related Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Cargo Documentation](https://doc.rust-lang.org/cargo/)
- [Tokio Documentation](https://tokio.rs/)
- [Axum Web Framework](https://github.com/tokio-rs/axum)

## Documentation

Generate and open the documentation:

```sh
cargo doc --open
```
