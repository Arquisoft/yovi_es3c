import React, { useState } from 'react';

const GameyBotTest: React.FC = () => {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestMove = async () => {
    setResponseMessage(null);
    setError(null);
    setLoading(true);

    try {
      const GAMEY_API_URL = import.meta.env.VITE_GAMEY_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${GAMEY_API_URL}/v1/ybot/choose/random_bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: 7,
          players: ['1', '2'],
          turn: 0,
          layout: './../.../..../...../....../.......',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponseMessage(`Bot move: X=${data.coords.x}, Y=${data.coords.y}, Z=${data.coords.z}`);
      } else {
        setError(data.error || 'Server error');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='gamey-test'>
      <h3>Game Y connection test</h3>

      <button onClick={handleRequestMove} className='submit-button' disabled={loading}>
        {loading ? 'Requesting...' : 'Get Bot Move'}
      </button>

      {responseMessage && (
        <div className='success-message' style={{ marginTop: 12, color: 'green' }}>
          {responseMessage}
        </div>
      )}

      {error && (
        <div className='error-message' style={{ marginTop: 12, color: 'red' }}>
          {error}
        </div>
      )}

    </div>
  );
};

export default GameyBotTest;