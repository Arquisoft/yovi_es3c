import React, { useState, useEffect } from "react";

const estrategias = ["aleatoria", "heuristica", "minimax", "mcts"];
const dificultades = ["facil", "media", "dificil"];

const labels: Record<string, string> = {
    facil: "Fácil",
    media: "Media",
    dificil: "Difícil",
    aleatoria: "Aleatorio",
    heuristica: "Heurístico",
    minimax: "Minimax",
    mcts: "Monte Carlo"
};

interface GameSetupFormProps {
    onStart: (config: { dificultad: string; estrategia: string; tamano: number }) => void;
}

export const GameSetupForm: React.FC<GameSetupFormProps> = ({ onStart }) => {
    const [dificultad, setDificultad] = useState(() => localStorage.getItem("setup-dificultad") || "media");
    const [estrategia, setEstrategia] = useState(() => localStorage.getItem("setup-estrategia") || "minimax");
    const [tamano, setTamano] = useState(() => {
        const t = localStorage.getItem("setup-tamano");
        return t ? parseInt(t) : 15;
    });

    useEffect(() => {
        localStorage.setItem("setup-dificultad", dificultad);
    }, [dificultad]);
    useEffect(() => {
        localStorage.setItem("setup-estrategia", estrategia);
    }, [estrategia]);
    useEffect(() => {
        localStorage.setItem("setup-tamano", tamano.toString());
    }, [tamano]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart({ dificultad, estrategia, tamano });
    };

    return (
        <form className="game-setup-form game-setup-outer dashboard-card" onSubmit={handleSubmit}>
            <h2 className="game-setup-title">Configura tu partida</h2>
            <div className="setup-section">
                <label className="setup-label">Estrategia</label>
                <div className="options-layout grid-2x2">
                    {estrategias.map(e => (
                        <button
                            type="button"
                            key={e}
                            className={`option-btn ${estrategia === e ? "selected" : ""}`}
                            onClick={() => setEstrategia(e)}
                        >
                            {labels[e]}
                        </button>
                    ))}
                </div>
            </div>
            <div className="setup-section">
                <label className="setup-label">Dificultad</label>
                <div className="options-layout flex-row">
                    {dificultades.map(d => (
                        <button
                            type="button"
                            key={d}
                            className={`option-btn ${dificultad === d ? "selected" : ""}`}
                            onClick={() => setDificultad(d)}
                        >
                            {labels[d]}
                        </button>
                    ))}
                </div>
            </div>
            <div className="setup-section">
                <div className="label-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <label className="setup-label">Tamaño del tablero</label>
                    <span className="badge board-badge">{tamano} × {tamano} × {tamano}</span>
                </div>
                <div className="slider-wrapper">
                    <input
                        type="range" min="10" max="30" value={tamano}
                        onChange={(e) => setTamano(parseInt(e.target.value))}
                        className="modern-slider"
                        step="1"
                        list="tickmarks"
                    />
                    <datalist id="tickmarks">
                        {[...Array(21)].map((_, i) => {
                            const val = 10 + i;
                            return <option key={val} value={val} />;
                        })}
                    </datalist>
                    <div className="slider-ticks">
                        {[...Array(11)].map((_, i) => {
                            const val = 10 + i * 2;
                            const isMajor = val === 10 || val === 20 || val === 30;
                            return (
                                <span
                                    key={val}
                                    style={{ left: `${(i * 100) / 10}%` }}
                                    className={`slider-tick-label${isMajor ? ' slider-tick-label-major' : ''}`}
                                >
                                    {val}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
            <button type="submit" className="submit-game-btn">
                Jugar
            </button>
        </form>
    );
};