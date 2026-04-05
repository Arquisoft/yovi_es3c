import { useEffect, useState, useRef } from 'react';
import './TurnTimer.css';

interface TurnTimerProps {
  timeLimit: number; // tiempo límite en segundos
  isActive: boolean; // si el timer debe estar contando
  onTimeUp?: () => void; // callback cuando el tiempo se acabe
  label?: string; // etiqueta (ej: "Tu turno", "Turno del bot")
  type?: 'player' | 'bot'; // tipo de timer (jugador o bot)
}

function TurnTimer({ timeLimit, isActive, onTimeUp, label, type = 'player' }: TurnTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledTimeUpRef = useRef(false);

  // Limpiar intervalo cuando se desmonta o cuando isActive cambia
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Resetear el flag de timeUp y el temporizador
    if (isActive) {
      hasCalledTimeUpRef.current = false;
      setTimeRemaining(timeLimit);

      // Crear nuevo intervalo
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0 && !hasCalledTimeUpRef.current) {
            hasCalledTimeUpRef.current = true;
            onTimeUp?.();
            return 0;
          }
          return Math.max(0, newTime);
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeLimit, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isDanger = isActive && timeRemaining <= 5 && timeRemaining > 0;

  return (
    <div className={`turn-timer turn-timer-${type} ${isActive ? 'active' : 'inactive'} ${isDanger ? 'danger' : ''}`}>
      {label && <span className="timer-label">{label}</span>}
      <span className="timer-display">{formatTime(timeRemaining)}</span>
    </div>
  );
}

export default TurnTimer;
