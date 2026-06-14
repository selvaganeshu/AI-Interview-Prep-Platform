import { useEffect, useState } from 'react';

export default function InterviewTimer({ duration = 30, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);

  useEffect(() => {
    setSecondsLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp && onTimeUp();
      return;
    }
    const t = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft, onTimeUp]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 py-2">
      <div className="text-lg font-mono">{mm}:{ss}</div>
    </div>
  );
}
