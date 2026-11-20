import React, { useState } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { SuccessModal } from '../../components/SuccessModal';
import { sound } from '../../utils/sound';
import { CAMILA_DETECTIVE_CASES } from '../../data/parte2Data';
import { Search, ShieldAlert, ArrowRight, FileText } from 'lucide-react';

export const CamilaDetectives: React.FC = () => {
  const [currentCaseIdx, setCurrentCaseIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAudited, setIsAudited] = useState(false);
  const [resolvedCases, setResolvedCases] = useState<number[]>([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const totalCases = CAMILA_DETECTIVE_CASES.length;
  const currentCase = CAMILA_DETECTIVE_CASES[currentCaseIdx];

  const handleSelectOption = (idx: number) => {
    if (isAudited) return;
    sound.pop();
    setSelectedOptionIdx(idx);
  };

  const handleAuditCase = () => {
    if (selectedOptionIdx === null || isAudited) return;
    setIsAudited(true);

    const isCorrect = currentCase.options[selectedOptionIdx].isCorrect;
    if (isCorrect) {
      sound.success();
      if (!resolvedCases.includes(currentCase.id)) {
        setResolvedCases(r => [...r, currentCase.id]);
      }
    } else {
      sound.error();
    }
  };

  const handleNextCase = () => {
    sound.click();
    if (currentCaseIdx < totalCases - 1) {
      setCurrentCaseIdx(c => c + 1);
      setSelectedOptionIdx(null);
      setIsAudited(false);
    } else {
      setIsSuccessOpen(true);
      sound.fanfare();
    }
  };

  const handleReset = () => {
    sound.click();
    setCurrentCaseIdx(0);
    setSelectedOptionIdx(null);
    setIsAudited(false);
    setResolvedCases([]);
    setIsSuccessOpen(false);
  };

  return (
    <div className="ios-animate-enter" style={{ padding: '20px 16px 80px', maxWidth: '440px', margin: '0 auto' }}>
      <GameHeading 
        title="Camila. Detectives digitales 🔎" 
        hint="Inspecciona instrumentos de evaluación con defectos y descubre los errores pedagógicos." 
      />

      <GameProgress value={resolvedCases.length} total={totalCases} label="Casos resueltos" />

      {/* Case File Header */}
      <div className="ios-card" style={{
        padding: '16px',
        background: '#FFFFFF',
        marginBottom: '14px',
        borderLeft: '4px solid #AF52DE'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#AF52DE', textTransform: 'uppercase' }}>
            Expediente de Auditoría {currentCaseIdx + 1}/{totalCases}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {currentCase.suspectInstrument}
          </span>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {currentCase.title}
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          {currentCase.caseDescription}
        </p>
      </div>

      {/* Defective Snippet Evidence Card */}
      <div className="ios-card" style={{
        padding: '16px',
        background: '#FFF9E6',
        border: '1px solid #FFE58F',
        borderRadius: '16px',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <ShieldAlert size={16} color="#D48800" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#D48800', textTransform: 'uppercase' }}>
            Evidencia del Instrumento Defectuoso
          </span>
        </div>
        <pre style={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '12.5px',
          color: '#595959',
          lineHeight: 1.5,
          margin: 0
        }}>
          {currentCase.defectSnippet}
        </pre>
      </div>

      {/* Detective Challenge */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          {currentCase.challenge}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentCase.options.map((opt, idx) => {
            const isSelected = selectedOptionIdx === idx;
            let bg = '#FFFFFF';
            let border = '1px solid var(--separator)';
            let color = 'var(--text-primary)';

            if (isAudited) {
              if (opt.isCorrect) {
                bg = 'var(--apple-green-tint)';
                border = '1.5px solid var(--apple-green)';
                color = 'var(--apple-green)';
              } else if (isSelected) {
                bg = 'var(--apple-red-tint)';
                border = '1.5px solid var(--apple-red)';
                color = 'var(--apple-red)';
              }
            } else if (isSelected) {
              bg = 'var(--apple-blue-tint)';
              border = '1.5px solid var(--apple-blue)';
              color = 'var(--apple-blue)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAudited}
                className="ios-card"
                style={{
                  padding: '14px',
                  textAlign: 'left',
                  background: bg,
                  border,
                  color,
                  fontSize: '13.5px',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  cursor: isAudited ? 'default' : 'pointer',
                  transition: 'all 140ms ease'
                }}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action / Next Case Panel */}
      {!isAudited ? (
        <button
          onClick={handleAuditCase}
          disabled={selectedOptionIdx === null}
          className="ios-button ios-button-primary"
          style={{ width: '100%', padding: '13px', fontSize: '15px' }}
        >
          <Search size={16} />
          <span>Dictaminar resolución</span>
        </button>
      ) : (
        <div className="ios-card ios-animate-enter" style={{
          padding: '16px',
          background: 'var(--surface-secondary)',
          marginTop: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <FileText size={16} color="var(--apple-blue)" />
            <strong style={{ fontSize: '13px', color: 'var(--apple-blue)' }}>Informe del Peritaje Pedagógico:</strong>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '6px' }}>
            {selectedOptionIdx !== null && currentCase.options[selectedOptionIdx].feedback}
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '14px' }}>
            💡 {currentCase.resolutionGuide}
          </p>
          <button
            onClick={handleNextCase}
            className="ios-button ios-button-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            <span>{currentCaseIdx < totalCases - 1 ? 'Siguiente Caso de Detective' : 'Completar Auditoría'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        title="¡Casos Resueltos con Éxito, Detective!"
        subtitle="Identificas con precisión los errores comunes en rúbricas y sabes cómo formular descriptores objetivos."
        returnTo="/parte-2"
        scoreText={`${totalCases} de ${totalCases} expedientes resueltos`}
        onRetry={handleReset}
      />
    </div>
  );
};
