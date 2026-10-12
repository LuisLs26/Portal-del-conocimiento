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
  name: string;
  topic: string;
  path: string;
}

const ACTIVITIES_QR: ActivityQRInfo[] = [
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
  }
];

export const QRManager: React.FC = () => {
  const [domain, setDomain] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return origin;
      }
    }
    const saved = localStorage.getItem('cf_custom_domain');
    return saved || 'https://portal-del-conocimiento.pages.dev';
  });

  const [copiedWeek, setCopiedWeek] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [qrSvgMap, setQrSvgMap] = useState<{ [week: number]: string }>({});
  const canvasRefs = useRef<{ [week: number]: HTMLCanvasElement | null }>({});

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setDomain(val);
    localStorage.setItem('cf_custom_domain', val);
  };

  const cleanBaseUrl = domain.replace(/\/+$/, '');

  useEffect(() => {
    ACTIVITIES_QR.forEach(async (act) => {
      const fullUrl = `${cleanBaseUrl}${act.path}`;

      const canvas = canvasRefs.current[act.week];
      if (canvas) {
        try {
          await QRCode.toCanvas(canvas, fullUrl, {
            width: 1000,
            margin: 4,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'H'
          });
        } catch {
          // Ignore
        }
      }

      try {
        const svgString = await QRCode.toString(fullUrl, {
          type: 'svg',
          margin: 4,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        });
        setQrSvgMap((prev) => ({ ...prev, [act.week]: svgString }));
      } catch {
        // Ignore
      }
    });
  }, [cleanBaseUrl]);

  const handleCopyLink = async (week: number, fullUrl: string) => {
    sound.click();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedWeek(week);
      setTimeout(() => setCopiedWeek(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPNG = (act: ActivityQRInfo) => {
    sound.click();
    const canvas = canvasRefs.current[act.week];
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_Semana_${act.week}_${act.name.replace(/\s+/g, '_')}_1000px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSVG = (act: ActivityQRInfo) => {
    sound.click();
    const svgStr = qrSvgMap[act.week];
    if (!svgStr) return;

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_Semana_${act.week}_${act.name.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZIP = async () => {
    sound.click();
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folderPng = zip.folder('QR_PNG_1000px');
      const folderSvg = zip.folder('QR_SVG_Vector');

      for (const act of ACTIVITIES_QR) {
        const canvas = canvasRefs.current[act.week];
        if (canvas && folderPng) {
          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          folderPng.file(`Semana_${act.week}_${act.name.replace(/\s+/g, '_')}.png`, base64Data, { base64: true });
        }

        const svgStr = qrSvgMap[act.week];
        if (svgStr && folderSvg) {
          folderSvg.file(`Semana_${act.week}_${act.name.replace(/\s+/g, '_')}.svg`, svgStr);
        }
      }

      const manifest = ACTIVITIES_QR.map(
        (a) => `Semana ${a.week}: ${a.name} -> ${cleanBaseUrl}${a.path}`
      ).join('\n');
      zip.file('ENLACES_LIBRO.txt', manifest);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Codigos_QR_Libro_Evaluacion.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Ignore
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
            Códigos QR del Libro
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Cada código abre directamente su actividad (sin pasar por el inicio).
          </p>
        </div>

        {/* Domain Configuration Card */}
        <div className="ios-card" style={{ padding: '16px 14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Globe size={16} color="var(--apple-blue)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Dominio Público en Cloudflare
            </span>
          </div>

          <input
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
              fontSize: '13px',
              fontWeight: 500,
              outline: 'none',
              marginBottom: '10px'
            }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownloadZIP}
              disabled={isZipping}
              className="ios-button ios-button-primary"
              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
            >
              <FileArchive size={14} />
              <span>{isZipping ? 'Generando...' : 'Descargar ZIP (5 QR)'}</span>
            </button>

            <button
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

        {/* 5 QR Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {ACTIVITIES_QR.map((act) => {
            const fullUrl = `${cleanBaseUrl}${act.path}`;
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
                  SEMANA {act.week}
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
                    style={{
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
                    onClick={() => handleDownloadPNG(act)}
                    className="ios-button ios-button-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                  >
                    <Download size={12} />
                    <span>PNG (1000px)</span>
                  </button>

                  <button
                    onClick={() => handleDownloadSVG(act)}
                    className="ios-button ios-button-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                  >
                    <Download size={12} />
                    <span>SVG</span>
                  </button>
                </div>

                <a
                  href={fullUrl}
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
            header { display: none !important; }
            body { background: #FFFFFF !important; color: #000000 !important; }
            @page { size: A4 portrait; margin: 1cm; }
          }
        `}</style>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '18pt', fontWeight: 'bold', marginBottom: '2pt' }}>
            Evaluación de los aprendizajes
          </h1>
          <p style={{ fontSize: '11pt', color: '#666666' }}>
            Códigos QR de Acceso Directo por Semana
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {ACTIVITIES_QR.map((act) => {
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
                  Semana {act.week}: {act.name}
                </div>
                <div style={{ fontSize: '8pt', color: '#666666', marginBottom: '8pt' }}>
                  {act.topic}
                </div>
                <div 
                  style={{ width: '150px', height: '150px', margin: '0 auto 6pt' }}
                  dangerouslySetInnerHTML={{ __html: svgContent || '' }}
                />
                <div style={{ fontSize: '7pt', color: '#333333' }}>
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
