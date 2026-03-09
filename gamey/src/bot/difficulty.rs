/// Nivel de dificultad para los bots.

// Derive es un trait de Rust. Con esto definimos los contratos para que el compilador genere el código.
#[derive(Debug, Clone, Copy, PartialEq, Eq)] 
pub enum Difficulty {
    Easy, 
    Hard,
}