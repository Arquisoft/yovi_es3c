import { useEffect, useState } from 'react';
import './TurnTimer.css';

interface TurnTimerProps {
  timeLimit: number; // tiempo límite en segundos
  isActive: boolean; // si el timer debe estar contando
  onTimeUp?: () => void; // callback cuando el tiempo se acabe
  label?: string; // etiqueta (ej: "Tu turno", "Turno del bot")
}

function TurnTimer({ timeLimit, isActive, onTimeUp, label }: TurnTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  useEffect(() => {
    setTimeRemaining(timeLimit);
  }, [timeLimit, isActive]);

  useEffect(() => {
    if (!isActive || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onTimeUp?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timeRemaining <= 10 && timeRemaining > 0;
  const isDanger = timeRemaining <= 5;

  return (
    <div className={`turn-timer ${isActive ? 'active' : 'inactive'} ${isWarning ? 'warning' : ''} ${isDanger ? 'danger' : ''}`}>
      {label && <span className="timer-label">{label}</span>}
      <span className="timer-display">{formatTime(timeRemaining)}</span>
    </div>
  );
}

export default TurnTimer;
