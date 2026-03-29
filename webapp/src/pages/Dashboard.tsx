import React, { useEffect, useState } from "react";
import { UserStats } from "../components/UserStats";
import { GameSetupForm } from "../components/GameSetupForm";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserStats } from "../services/gameService";
import "../pages-styles/Dashboard.css";

interface UserStatsData {
    username: string;
    totalGames: number;
    gamesWon: number;
    gamesLost: number;
    score?:number;
}

/**
 * Componente Dashboard - Pantalla intermedia entre el login/registro y la pantalla del juego 
 * 
 * Este componente contiene:
 * - UserStats: Tarjetas con las estadísticas del usuario (cargadas desde MongoDB)
 * - GameSetupForm: Formulario para configurar la partida
 * 
 * Cuando el usuario hace clic en "Iniciar partida", se llama handleStartGame
 * que recibe la configuración (dificultad, estrategia, tamaño) y navega a la pantalla del juego.
 */
export const Dashboard: React.FC = () => {
    // Obtener usuario autenticado y función de navegación
    const { user } = useAuth();
    const navigate = useNavigate();

    // Estado para las estadísticas del usuario
    const [userStats, setUserStats] = useState<UserStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Cargar estadísticas del usuario cuando el componente monta
     * o cuando cambia el usuario autenticado
     */
    useEffect(() => {
        const loadUserStats = async () => {
            if (!user || !user.username) {
                setError("Usuario no autenticado");
                setLoading(false);
                return;
            }

            try {
                const stats = await getUserStats(user.username);
                setUserStats(stats);
                setError(null);
            } catch (err) {
                console.error("Error cargando estadísticas:", err);
                setError("No se pudieron cargar las estadísticas");
            } finally {
                setLoading(false);
            }
        };

        loadUserStats();
    }, [user]);

    /**
     * Manejador cuando se inicia una partida
     * Recibe la configuración (dificultad, estrategia, tamaño)
     * y navega a la pantalla del juego pasando los parámetros.
     */
    const handleStartGame = (config: { dificultad: string; estrategia: string; tamano: number }) => {
        // Navegar a /game con los parámetros de configuración
        navigate('/game', {
            state: {
                size: config.tamano,
                botId: config.estrategia,
                difficulty: config.dificultad
            }
        });
    };

    return (
        <div className="dashboard">
            <GameSetupForm onStart={handleStartGame} />
            <div className="dashboard-card">
                {loading ? (
                    <p>Cargando estadísticas...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>Error: {error}</p>
                ) : userStats ? (
                    <UserStats stats={userStats} />
                ) : (
                    <UserStats />
                )}
            </div>
        </div>
    );
};