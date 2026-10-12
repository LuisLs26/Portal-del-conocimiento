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
  Sparkles,
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
    topic: 'Fundamentos de la evaluación de los aprendizajes',
    path: '/semana/1'
  },
  {
    week: 2,
    name: 'Pon a prueba tus conocimientos',
    topic: 'Evaluación desde el enfoque por competencias',
    path: '/semana/2'
  },
  {
    week: 3,
    name: 'Relaciona los conceptos',
    topic: 'Propósitos y criterios de evaluación',
    path: '/semana/3'
  },
  {
    week: 4,
    name: 'Completa el aprendizaje',
    topic: 'Repaso integrador por competencias',
    path: '/semana/4'
  },
  {
    week: 5,
    name: 'Sopa de letras',
    topic: 'Situaciones significativas, criterios y evidencias',
    path: '/semana/5'
  }
];

export const QRManager: React.FC = () => {
  // Domain state: default to production pages.dev or current origin if not localhost
  const [domain, setDomain] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return origin;
      }
    }
    const saved = localStorage.getItem('cf_custom_domain');
    return saved || 'https://evaluacion-aprendizajes.pages.dev';
  });

  const [copiedWeek, setCopiedWeek] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [qrSvgMap, setQrSvgMap] = useState<{ [week: number]: string }>({});
  const canvasRefs = useRef<{ [week: number]: HTMLCanvasElement | null }>({});

  // Save custom domain
  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    setDomain(val);
    localStorage.setItem('cf_custom_domain', val);
  };

  // Clean formatted domain URL
  const cleanBaseUrl = domain.replace(/\/+$/, '');

  // Generate QR codes for all 5 activities
  useEffect(() => {
    ACTIVITIES_QR.forEach(async (act) => {
      const fullUrl = `${cleanBaseUrl}${act.path}`;

      // Render to hidden high-res canvas (1000x1000px)
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

      // Generate SVG string
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

  // Copy link to clipboard
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

  // Download high-resolution PNG (1000x1000px)
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

  // Download vector SVG
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

  // Download all 5 QR codes as a ZIP package
  const handleDownloadZIP = async () => {
    sound.click();
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folderPng = zip.folder('QR_PNG_1000px');
      const folderSvg = zip.folder('QR_SVG_Vector');

      for (const act of ACTIVITIES_QR) {
        // Add PNG
        const canvas = canvasRefs.current[act.week];
        if (canvas && folderPng) {
          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          folderPng.file(`Semana_${act.week}_${act.name.replace(/\s+/g, '_')}.png`, base64Data, { base64: true });
        }

        // Add SVG
        const svgStr = qrSvgMap[act.week];
        if (svgStr && folderSvg) {
          folderSvg.file(`Semana_${act.week}_${act.name.replace(/\s+/g, '_')}.svg`, svgStr);
        }
      }

      // Add a text file with links manifest
      const manifest = ACTIVITIES_QR.map(
        (a) => `Semana ${a.week}: ${a.name} -> ${cleanBaseUrl}${a.path}`
      ).join('\n');
      zip.file('ENLACES_LIBRO.txt', manifest);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Codigos_QR_Libro_Evaluacion_Aprendizajes.zip';
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

  // Trigger A4 Print layout
  const handlePrintA4 = () => {
    sound.click();
    window.print();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 16px 80px' }}>
      {/* Screen Presentation (Hidden during print) */}
      <div className="no-print">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            background: 'rgba(18, 61, 50, 0.08)',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--verde-oscuro)',
            marginBottom: '10px'
          }}>
            <Sparkles size={13} color="var(--dorado-elegante)" />
            <span>Centro de Códigos QR para Impresión Editorial</span>
          </div>

          <h1 className="font-editorial" style={{
            fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 700,
            color: 'var(--verde-oscuro)',
            lineHeight: 1.2,
            marginBottom: '6px'
          }}>
            Códigos QR del Libro Físico
          </h1>

          <p style={{ fontSize: '14px', color: 'var(--gris-neutro)', maxWidth: '680px', margin: '0 auto' }}>
            Genera, previsualiza y descarga los códigos QR en alta resolución (1000x1000px) y vectores SVG listos para maquetar en las páginas del libro.
          </p>
        </div>

        {/* Cloudflare Pages Public Domain Configuration Card */}
        <div 
          className="liquid-glass animate-fade-in"
          style={{ padding: '24px 28px', marginBottom: '32px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--verde-oscuro)',
            marginBottom: '8px'
          }}>
            <Globe size={18} color="var(--dorado-elegante)" />
            <span>Configuración del Dominio Público (Cloudflare Pages)</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--gris-neutro)', marginBottom: '14px', lineHeight: 1.5 }}>
            Ingresa la URL definitiva de tu despliegue en Cloudflare Pages o tu dominio personalizado. Todos los códigos QR y enlaces se actualizarán en tiempo real para apuntar a la dirección web correcta:
          </p>

          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <input
              type="url"
              value={domain}
              onChange={handleDomainChange}
              placeholder="https://tu-proyecto.pages.dev"
              style={{
                flex: 1,
                minWidth: '280px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid rgba(18, 61, 50, 0.15)',
                background: '#FFFFFF',
                color: 'var(--gris-oscuro)',
                fontWeight: 600,
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)'
              }}
            />

            <button
              onClick={handleDownloadZIP}
              disabled={isZipping}
              className="apple-button apple-button-primary"
              style={{ padding: '12px 22px' }}
            >
              <FileArchive size={16} />
              <span>{isZipping ? 'Generando ZIP...' : 'Descargar los 5 QR en ZIP'}</span>
            </button>

            <button
              onClick={handlePrintA4}
              className="apple-button apple-button-secondary"
              style={{ padding: '12px 20px' }}
            >
              <Printer size={16} />
              <span>Imprimir Hoja A4</span>
            </button>
          </div>
        </div>

        {/* 5 Individual QR Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {ACTIVITIES_QR.map((act) => {
            const fullUrl = `${cleanBaseUrl}${act.path}`;
            const isCopied = copiedWeek === act.week;

            return (
              <div
                key={act.week}
                className="liquid-glass"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                {/* Week & Activity Tag */}
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(18, 61, 50, 0.07)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--verde-oscuro)',
                  marginBottom: '10px'
                }}>
                  SEMANA {act.week}
                </div>

                <h3 className="font-editorial" style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--verde-oscuro)',
                  marginBottom: '4px'
                }}>
                  {act.name}
                </h3>

                <p style={{
                  fontSize: '12px',
                  color: 'var(--dorado-elegante)',
                  fontWeight: 600,
                  marginBottom: '16px'
                }}>
                  {act.topic}
                </p>

                {/* QR Display Card (Black on White for guaranteed print quality) */}
                <div style={{
                  padding: '14px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Canvas hidden off-screen or rendered */}
                  <canvas
                    ref={(el) => { canvasRefs.current[act.week] = el; }}
                    style={{
                      width: '200px',
                      height: '200px',
                      display: 'block'
                    }}
                  />
                </div>

                {/* Full Link with Copy action */}
                <div style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(18, 61, 50, 0.04)',
                  border: '1px solid rgba(18, 61, 50, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 500,
                    color: 'var(--gris-oscuro)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'left'
                  }}>
                    {fullUrl}
                  </span>

                  <button
                    onClick={() => handleCopyLink(act.week, fullUrl)}
                    className="apple-button"
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: isCopied ? 'var(--verde-exito)' : 'rgba(18, 61, 50, 0.08)',
                      color: isCopied ? '#FFFFFF' : 'var(--verde-oscuro)',
                      borderRadius: 'var(--radius-pill)',
                      flexShrink: 0
                    }}
                    title="Copiar enlace"
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                {/* Download Actions (PNG & SVG) */}
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    onClick={() => handleDownloadPNG(act)}
                    className="apple-button apple-button-secondary"
                    style={{ flex: 1, padding: '10px 8px', fontSize: '12px' }}
                    title="Descargar imagen PNG en resolución 1000x1000px"
                  >
                    <Download size={13} />
                    <span>PNG (1000px)</span>
                  </button>

                  <button
                    onClick={() => handleDownloadSVG(act)}
                    className="apple-button apple-button-secondary"
                    style={{ flex: 1, padding: '10px 8px', fontSize: '12px' }}
                    title="Descargar gráfico vectorial SVG"
                  >
                    <Download size={13} />
                    <span>SVG Vector</span>
                  </button>
                </div>

                {/* Direct Test Link */}
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--dorado-elegante)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    marginTop: '12px'
                  }}
                >
                  <span>Probar enlace en nueva pestaña</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Printable A4 Sheet Section (Visible only when printing) */}
      <div className="print-only" style={{ display: 'none' }}>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            header, footer { display: none !important; }
            body { background: #FFFFFF !important; color: #000000 !important; }
            @page {
              size: A4 portrait;
              margin: 1.2cm;
            }
          }
        `}</style>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22pt', fontFamily: 'Georgia, serif', color: '#123D32', marginBottom: '4pt' }}>
            Evaluación de los aprendizajes
          </h1>
          <p style={{ fontSize: '12pt', color: '#C5A15A', fontStyle: 'italic', marginBottom: '4pt' }}>
            Códigos QR para las actividades formativas del libro impreso
          </p>
          <p style={{ fontSize: '9pt', color: '#666666' }}>
            Dominio base: {cleanBaseUrl}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          alignItems: 'start'
        }}>
          {ACTIVITIES_QR.map((act) => {
            const svgContent = qrSvgMap[act.week];
            return (
              <div
                key={act.week}
                style={{
                  border: '1px dashed #CCCCCC',
                  padding: '16px',
                  textAlign: 'center',
                  pageBreakInside: 'avoid'
                }}
              >
                <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#123D32', marginBottom: '2pt' }}>
                  SEMANA {act.week} — {act.name.toUpperCase()}
                </div>
                <div style={{ fontSize: '8.5pt', color: '#555555', marginBottom: '10pt' }}>
                  {act.topic}
                </div>

                <div 
                  style={{ width: '160px', height: '160px', margin: '0 auto 8pt' }}
                  dangerouslySetInnerHTML={{ __html: svgContent || '' }}
                />

                <div style={{ fontSize: '7.5pt', color: '#333333', wordBreak: 'break-all' }}>
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
