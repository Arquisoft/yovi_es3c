import { useEffect, useState, useCallback } from 'react';
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

  // Resetear cuando el timer se activate o cambie el timeLimit
  useEffect(() => {
    if (isActive) {
      setTimeRemaining(timeLimit);
    }
  }, [isActive, timeLimit]);

  // Memoizar el callback para evitar cambios innecesarios
  const handleTimeUp = useCallback(() => {
    onTimeUp?.();
  }, [onTimeUp]);

  // Interval para contar hacia atrás
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          handleTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, handleTimeUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isDanger = timeRemaining <= 5 && timeRemaining > 0;

  return (
    <div className={`turn-timer turn-timer-${type} ${isActive ? 'active' : 'inactive'} ${isDanger ? 'danger' : ''}`}>
      {label && <span className="timer-label">{label}</span>}
      <span className="timer-display">{formatTime(timeRemaining)}</span>
    </div>
  );
}

export default TurnTimer;
