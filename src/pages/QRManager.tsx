import { Link, useSearchParams } from 'react-router-dom';
import { parte2Info } from '../data/parte2Routes';
import { publicBaseUrl } from '../data/qrData';
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { sound } from '../utils/sound';
import {
  Download,
  Copy,
  Check,
  Globe,
  Printer,
  FileArchive,
  ExternalLink
} from 'lucide-react';

interface ActivityQRInfo {
  week: number;
  author?: string;
  name: string;
  topic: string;
  path: string;
}

const PART_ONE_QR: ActivityQRInfo[] = [
  {
    week: 1,
    name: 'Crucigrama',
    topic: 'Fundamentos de la evaluación',
    path: '/semana/1'
  },
  {
    week: 2,
    name: 'Cuestionario',
    topic: 'Enfoque por competencias',
    path: '/semana/2'
  },
  {
    week: 3,
    name: 'Relacionar conceptos',
    topic: 'Propósitos y criterios',
    path: '/semana/3'
  },
  {
    week: 4,
    name: 'Completar espacios',
    topic: 'Repaso integrador',
    path: '/semana/4'
  },
  {
    week: 5,
    name: 'Sopa de letras',
    topic: 'Situaciones y evidencias',
    path: '/semana/5'
  },
  { week: 6, name: 'Maratón', topic: 'Crea una sala y comparte su QR para jugar en vivo', path: '/maraton' }
];

const PART_TWO_QR = Object.entries(parte2Info).map(([path, activity], index): ActivityQRInfo => ({
  week: index + 7,
  name: activity.title,
  topic: 'Parte 2',
  author: activity.author,
  path,
}));

function activityLabel(activity: ActivityQRInfo) {
  return activity.author ?? `Semana ${activity.week}`;
}

function fileLabel(activity: ActivityQRInfo) {
  return `${activityLabel(activity)}_${activity.name}`.replace(/[^\p{L}\p{N}_-]+/gu, '_');
}

export const QRManager: React.FC = () => {
  const [params] = useSearchParams();
  const part = params.get('parte') === '2' ? 2 : 1;
  const activities = part === 2 ? PART_TWO_QR : PART_ONE_QR;
  const [domain, setDomain] = useState<string>(() => {
    const saved = localStorage.getItem('cf_custom_domain');
    return (saved && publicBaseUrl(saved)) || window.location.origin;
  });
  const [readyBase, setReadyBase] = useState<string | null>(null);
  const [error, setError] = useState('');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  const [copiedWeek, setCopiedWeek] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [qrSvgMap, setQrSvgMap] = useState<{ [week: number]: string }>({});
  const canvasRefs = useRef<{ [week: number]: HTMLCanvasElement | null }>({});

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setDomain(val);
    const base = publicBaseUrl(val);
    if (base) localStorage.setItem('cf_custom_domain', base);
  };

  const cleanBaseUrl = publicBaseUrl(domain);
  const ready = !!cleanBaseUrl && readyBase === `${part}:${cleanBaseUrl}`;

  useEffect(() => {
    let cancelled = false;
    setReadyBase(null); setQrSvgMap({}); setError('');
    if (!cleanBaseUrl) return;
    const options = { width: 1000, margin: 4, color: { dark: '#000000', light: '#FFFFFF' }, errorCorrectionLevel: 'H' as const };
    const timer = setTimeout(() => { Promise.all(activities.map(async act => {
      const url = `${cleanBaseUrl}${act.path}`;
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, url, options);
      const svg = await QRCode.toString(url, { ...options, type: 'svg' });
      return { act, canvas, svg };
    })).then(results => {
      if (cancelled) return;
      const map: Record<number, string> = {};
      for (const { act, canvas, svg } of results) {
        const target = canvasRefs.current[act.week];
        if (target) { target.width = canvas.width; target.height = canvas.height; target.getContext('2d')?.drawImage(canvas, 0, 0); }
        map[act.week] = svg;
      }
      setQrSvgMap(map); setReadyBase(`${part}:${cleanBaseUrl}`);
    }).catch(() => { if (!cancelled) setError('No se pudieron generar los códigos. Revisa el dominio e intenta nuevamente.'); });
    }, 180);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [cleanBaseUrl, activities, part]);

  const handleCopyLink = async (week: number, fullUrl: string) => {
    if (!ready) return;
    sound.click();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedWeek(week);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedWeek(null), 2000);
    } catch {
      setError('No se pudo copiar. Puedes copiar el enlace mostrado debajo del código.');
    }
  };

  const handleDownloadPNG = (act: ActivityQRInfo) => {
    if (!ready) return;
    sound.click();
    const canvas = canvasRefs.current[act.week];
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${fileLabel(act)}_1000px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSVG = (act: ActivityQRInfo) => {
    if (!ready) return;
    sound.click();
    const svgStr = qrSvgMap[act.week];
    if (!svgStr) return;

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${fileLabel(act)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZIP = async () => {
    if (!ready || isZipping) return;
    sound.click();
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folderPng = zip.folder('QR_PNG_1000px');
      const folderSvg = zip.folder('QR_SVG_Vector');

      for (const act of activities) {
        const canvas = canvasRefs.current[act.week];
        if (canvas && folderPng) {
          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          folderPng.file(`${fileLabel(act)}.png`, base64Data, { base64: true });
        }

        const svgStr = qrSvgMap[act.week];
        if (svgStr && folderSvg) {
          folderSvg.file(`${fileLabel(act)}.svg`, svgStr);
        }
      }

      const manifest = activities.map(
        (a) => `${activityLabel(a)}: ${a.name} -> ${cleanBaseUrl}${a.path}`
      ).join('\n');
      zip.file('ENLACES_LIBRO.txt', manifest);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = part === 2 ? 'Codigos_QR_Parte_2.zip' : 'Codigos_QR_Libro_Evaluacion.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo descargar el archivo ZIP. Intenta nuevamente.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="ios-animate-enter" style={{ padding: '16px 14px 60px' }}>
      <div className="no-print">
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase' }}>
            Impresión Editorial
          </span>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Códigos QR del Libro · Parte {part}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Cada código abre directamente su actividad (sin pasar por el inicio).
          </p>
        </div>

        <nav aria-label="Parte del libro" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Link className={`ios-button ios-button-${part === 1 ? 'primary' : 'secondary'}`} to="/qr" aria-current={part === 1 ? 'page' : undefined}>Parte 1</Link>
          <Link className={`ios-button ios-button-${part === 2 ? 'primary' : 'secondary'}`} to="/qr?parte=2" aria-current={part === 2 ? 'page' : undefined}>Parte 2</Link>
        </nav>

        {/* Domain Configuration Card */}
        <div className="ios-card" style={{ padding: '16px 14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Globe size={16} color="var(--apple-blue)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Dominio Público en Cloudflare
            </span>
          </div>

          <input
            aria-label="Dominio público"
            type="url"
            value={domain}
            onChange={handleDomainChange}
            placeholder="https://tu-proyecto.pages.dev"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--separator-dark)',
              background: 'var(--surface-secondary)',
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontWeight: 500,
              outline: 'none',
              marginBottom: '10px'
            }}
          />

          <p role="status">{!cleanBaseUrl ? 'Introduce una dirección completa: https://tu-dominio.com' : error || (!ready ? 'Generando códigos…' : `${activities.length} códigos listos para descargar.`)}</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownloadZIP}
              disabled={isZipping || !ready}
              className="ios-button ios-button-primary"
              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
            >
              <FileArchive size={14} />
              <span>{isZipping ? 'Generando...' : `Descargar ZIP (${activities.length} QR)`}</span>
            </button>

            <button
              disabled={!ready}
              onClick={() => {
                sound.click();
                window.print();
              }}
              className="ios-button ios-button-secondary"
              style={{ padding: '10px 14px', fontSize: '13px' }}
            >
              <Printer size={14} />
              <span>A4</span>
            </button>
          </div>
        </div>

        {/* QR Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activities.map((act) => {
            const fullUrl = cleanBaseUrl ? `${cleanBaseUrl}${act.path}` : '';
            const isCopied = copiedWeek === act.week;

            return (
              <div
                key={act.week}
                className="ios-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--apple-blue-tint)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--apple-blue)',
                  marginBottom: '6px'
                }}>
                  {activityLabel(act).toUpperCase()}
                </div>

                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {act.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {act.topic}
                </div>

                {/* QR Canvas Box */}
                <div style={{
                  padding: '10px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-subtle)',
                  border: '1px solid var(--separator)',
                  marginBottom: '12px'
                }}>
                  <canvas
                    ref={(el) => { canvasRefs.current[act.week] = el; }}
                    data-qr-week={act.week}
                    style={{
                      visibility: ready ? 'visible' : 'hidden',
                      width: '160px',
                      height: '160px',
                      display: 'block'
                    }}
                  />
                </div>

                {/* URL Bar */}
                <div style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {fullUrl}
                  </span>

                  <button
                    disabled={!ready}
                    onClick={() => handleCopyLink(act.week, fullUrl)}
                    className="ios-button"
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      background: isCopied ? 'var(--apple-green)' : 'var(--surface)',
                      color: isCopied ? '#FFFFFF' : 'var(--text-primary)',
                      borderRadius: 'var(--radius-pill)',
                      flexShrink: 0
                    }}
                  >
                    {isCopied ? <Check size={11} /> : <Copy size={11} />}
                    <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                {/* Download Actions */}
                <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                  <button
                    disabled={!ready}
                    onClick={() => handleDownloadPNG(act)}
                    className="ios-button ios-button-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                  >
                    <Download size={12} />
                    <span>PNG (1000px)</span>
                  </button>

                  <button
                    disabled={!ready}
                    onClick={() => handleDownloadSVG(act)}
                    className="ios-button ios-button-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                  >
                    <Download size={12} />
                    <span>SVG</span>
                  </button>
                </div>

                <a
                  href={ready ? fullUrl : undefined}
                  aria-disabled={!ready}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11.5px',
                    color: 'var(--apple-blue)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    marginTop: '8px'
                  }}
                >
                  <span>Abrir actividad</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="print-only" style={{ display: 'none' }}>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .print-only svg { display: block; width: 100%; height: 100%; }
            header { display: none !important; }
            .app-container { max-width: none !important; min-height: auto !important; }
            body { background: #FFFFFF !important; color: #000000 !important; }
            @page { size: A4 portrait; margin: 1cm; }
          }
        `}</style>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '18pt', fontWeight: 'bold', marginBottom: '2pt' }}>
            Evaluación de los aprendizajes
          </h1>
          <p style={{ fontSize: '11pt', color: '#666666' }}>
            Códigos QR de acceso directo · Parte {part}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {activities.map((act) => {
            const svgContent = qrSvgMap[act.week];
            return (
              <div
                key={act.week}
                style={{
                  border: '1px dashed #CCCCCC',
                  padding: '12px',
                  textAlign: 'center',
                  pageBreakInside: 'avoid'
                }}
              >
                <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>
                  {activityLabel(act)}: {act.name}
                </div>
                <div style={{ fontSize: '8pt', color: '#666666', marginBottom: '8pt' }}>
                  {act.topic}
                </div>
                <div
                  style={{ width: '150px', height: '150px', margin: '0 auto 6pt' }}
                  dangerouslySetInnerHTML={{ __html: svgContent || '' }}
                />
                <div style={{ fontSize: '7pt', color: '#333333', overflowWrap: 'anywhere' }}>
                  {cleanBaseUrl}{act.path}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
