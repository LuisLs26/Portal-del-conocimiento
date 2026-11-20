import { useCallback, useEffect, useRef, useState } from 'react';

export function useCountdown(seconds: number, running: boolean) {
  const deadline = useRef<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(seconds);

  const remaining = useCallback(() => deadline.current === null
    ? seconds
    : Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)), [seconds]);

  const restart = useCallback(() => {
    deadline.current = Date.now() + seconds * 1000;
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (deadline.current === null) restart();
    const update = () => setTimeLeft(remaining());
    const timer = window.setInterval(update, 150);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [remaining, restart, running]);

  return { timeLeft, remaining, restart };
}
