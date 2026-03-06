import React, { useState } from "react";

/**
 * Listado de estrategias disponibles del juego Y
 * Cada una es una variante diferente con sus propias reglas
 * ORDENADAS ALFABÉTICAMENTE
 */
const estrategias = [
    "estandar",
    "fortune-y",
    "hex",
    "holey-y",
    "master-y",
    "pastel",
    "poly-y",
    "tabu-y",
    "why-not"
];

const estrategiaLabels = {
    "estandar": "Estándar",
    "fortune-y": "Fortune Y",
    "hex": "Hex",
    "holey-y": "Holey Y",
    "master-y": "Master Y",
    "pastel": "Pastel",
    "poly-y": "Poly-Y",
    "tabu-y": "Tabu Y",
    "why-not": "WhY not"
};

/**
 * Tamaños de tablero disponibles (10x10, 15x15, 20x20)
 */
const tamanos = [10, 15, 20];

/**
 * Niveles de dificultad disponibles
 */
const dificultades = ["facil", "media", "dificil"];

const dificultadLabels = {
    "facil": "Fácil",
    "media": "Media",
    "dificil": "Difícil"
};

interface GameSetupFormProps {
    onStart: (config: { dificultad: string; estrategia: string; tamano: number }) => void;
}

/**
 * Componente GameSetupForm - Formulario para configurar la partida con las distintas opciones del juego Y.
 * 
 * Este componente permite al usuario seleccionar:
 * - Dificultad: 3 opciones con botones
 * - Estrategia: 9 opciones en una grid de 3x3
 * - Tamaño del tablero: 3 opciones con botones grandes
 * 
 * Cada selección se guardará para crear la partida.
 */
export const GameSetupForm: React.FC<GameSetupFormProps> = ({ onStart }) => {
    // Estados para las 3 opciones del juego
    const [dificultad, setDificultad] = useState("facil");
    const [estrategia, setEstrategia] = useState("estandar");
    const [tamano, setTamano] = useState(tamanos[0]);

    /**
     * Manejador del envío del formulario
     * Previene el comportamiento por defecto y llama la función onStart
     * con la configuración seleccionada
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart({ dificultad, estrategia, tamano });
    };

    return (
        <form className="game-setup-form" onSubmit={handleSubmit}>
            <h2>Configura tu partida</h2>

            {/* SECCIÓN DE DIFICULTAD */}
            <label>
                Dificultad:
                <div className="options-group">
                    {dificultades.map(d => (
                        <button
                            type="button"
                            key={d}
                            className={`select-btn ${dificultad === d ? "selected" : ""}`}
                            onClick={() => setDificultad(d)}
                        >
                            {dificultadLabels[d as keyof typeof dificultadLabels]}
                        </button>
                    ))}
                </div>
            </label>

            {/* SECCIÓN DE ESTRATEGIA */}
            <label>
                Estrategia:
                <div className="strategies-grid">
                    {estrategias.map(e => (
                        <button
                            type="button"
                            key={e}
                            className={`select-btn ${estrategia === e ? "selected" : ""}`}
                            onClick={() => setEstrategia(e)}
                        >
                            {estrategiaLabels[e as keyof typeof estrategiaLabels]}
                        </button>
                    ))}
                </div>
            </label>

            {/* SECCIÓN DE TAMAÑO DEL TABLERO */}
            <label>
                Tamaño del tablero:
                <div className="board-size-options">
                    {tamanos.map(t => (
                        <button
                            type="button"
                            key={t}
                            className={`select-btn ${tamano === t ? "selected" : ""}`}
                            onClick={() => setTamano(t)}
                        >
                            {t}x{t}
                        </button>
                    ))}
                </div>
            </label>

            <button type="submit">Iniciar partida</button>
        </form>
    );
};