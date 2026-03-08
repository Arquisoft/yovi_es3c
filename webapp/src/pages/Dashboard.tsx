import React from "react";
import { UserStats } from "../components/UserStats";
import { GameSetupForm } from "../components/GameSetupForm";
import "../pages-styles/Dashboard.css";

/**
 * Componente Dashboard - Pantalla intermedia entre el login/registro y la pantalla del juego 
 * 
 * Este componente contiene:
 * - UserStats: Tarjetas con las estadísticas del usuario
 * - GameSetupForm: Formulario para configurar la partida
 * 
 * Cuando el usuario hace clic en "Iniciar partida", se llama handleStartGame
 * que recibe la configuración seleccionada
 */
export const Dashboard: React.FC = () => {
    /**
     * Manejador cuando se inicia una partida
     * Recibe la configuración (dificultad, estrategia, tamaño)
     * y muestra un alert (temporalmente). Posteriomente, aquí podrías navegar a la pantalla de juego.
     */
    const handleStartGame = (config: { dificultad: string; estrategia: string; tamano: number }) => {
        alert(`Partida iniciada con:\nDificultad: ${config.dificultad}\nEstrategia: ${config.estrategia}\nTablero: ${config.tamano}x${config.tamano}`);
        // Aquí podrías navegar a la pantalla de juego.
    };

    return (
        <div className="dashboard">
            <GameSetupForm onStart={handleStartGame} />
            <div className="dashboard-card">
                <UserStats />
            </div>
        </div>
    );
};