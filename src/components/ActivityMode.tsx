import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/sound';

export function ActivityMode() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(sound.isEnabled());
  useEffect(() => {
    const enter = (event: PointerEvent) => {
      if ((event.target as Element).closest('[data-exit-activity]')) return;
      if (document.fullscreenEnabled && !document.fullscreenElement) {
        void document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    // Finish the first gesture before changing the viewport (especially a word-search drag).
    document.addEventListener('pointerup', enter, { once: true });
    return () => {
      document.removeEventListener('pointerup', enter);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, []);
  return <nav className="activity-controls" aria-label="Controles de la actividad">
    <button className="ios-button" aria-label={enabled ? 'Silenciar' : 'Activar sonido'} onClick={() => {
      sound.setEnabled(!enabled); setEnabled(!enabled); if (!enabled) sound.click();
    }}>{enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
    <button data-exit-activity className="ios-button" aria-label="Salir de la actividad" onClick={() => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
      navigate('/');
    }}><X size={20} /></button>
  </nav>;
}
