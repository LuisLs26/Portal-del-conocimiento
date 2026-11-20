import React, { useState } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { SuccessModal } from '../../components/SuccessModal';
import { sound } from '../../utils/sound';
import { 
  LEIDI_DETECTIVE_CASES, 
  type LeidiDetectiveCase 
} from '../../data/parte2Data';
import { 
  Search, 
  ShieldAlert, 
  ArrowRight
} from 'lucide-react';

export const LeidiDetectives: React.FC = () => {
  const [currentCaseIdx, setCurrentCaseIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAudited, setIsAudited] = useState(false);
  const [resolvedCases, setResolvedCases] = useState<number[]>([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const totalCases = LEIDI_DETECTIVE_CASES.length;
  const currentCase: LeidiDetectiveCase = LEIDI_DETECTIVE_CASES[currentCaseIdx];

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

  const handleRestart = () => {
    sound.click();
    setCurrentCaseIdx(0);
    setSelectedOptionIdx(null);
    setIsAudited(false);
    setResolvedCases([]);
    setIsSuccessOpen(false);
  };

  const selectedOption = selectedOptionIdx !== null ? currentCase.options[selectedOptionIdx] : null;

  return (
    <div className="part-two-game ios-animate-enter">
      <GameHeading 
        title="Detectives de errores!"
        hint="Semana 9: Audita los instrumentos de evaluación defectuosos e identifica el error metodológico." 
      />

      <GameProgress value={resolvedCases.length} total={totalCases} label="Casos periciales resueltos" />

      {/* Case Header & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'var(--apple-blue)',
          background: 'rgba(0, 122, 255, 0.1)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-pill)'
        }}>
          {currentCase.badge}
        </span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Instrumento: {currentCase.instrumentName}
        </span>
      </div>

      {/* Case Card / Crime Scene Document */}
      <div className="ios-card" style={{
        padding: '16px',
        border: '1.5px solid rgba(255, 149, 0, 0.35)',
        background: '#FFFFFF',
        borderRadius: '18px',
        marginBottom: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldAlert size={18} color="#FF9500" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentCase.defectiveInstrumentText.title}
          </span>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.35, margin: '0 0 10px' }}>
          {currentCase.defectiveInstrumentText.description}
        </p>

        {/* Defective Snippet Box */}
        <div style={{
          background: '#FFF9F0',
          borderLeft: '3px solid #FF9500',
          padding: '10px 12px',
          borderRadius: '8px',
          fontSize: '12.5px',
          fontFamily: 'monospace',
          color: '#8A5800',
          lineHeight: 1.45,
          wordBreak: 'break-word'
        }}>
          {currentCase.defectiveInstrumentText.problematicSnippet}
        </div>
      </div>

      {/* Interrogation Prompt */}
      <div style={{
        fontSize: '14px',
        fontWeight: 650,
        color: 'var(--text-primary)',
        marginBottom: '10px',
        lineHeight: 1.35
      }}>
        {currentCase.interrogationPrompt}
      </div>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {currentCase.options.map((opt, idx) => {
          const isSelected = selectedOptionIdx === idx;
          let borderCol = '1px solid var(--separator-dark)';
          let bgCol = '#FFFFFF';
          let textCol = 'var(--text-primary)';

          if (isAudited) {
            if (opt.isCorrect) {
              borderCol = '2px solid #34C759';
              bgCol = 'rgba(52, 199, 89, 0.08)';
            } else if (isSelected && !opt.isCorrect) {
              borderCol = '2px solid #FF3B30';
              bgCol = 'rgba(255, 59, 48, 0.08)';
            }
          } else if (isSelected) {
            borderCol = '2px solid var(--apple-blue)';
            bgCol = 'rgba(0, 122, 255, 0.05)';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAudited}
              className="ios-scale-press"
              style={{
                padding: '14px 12px',
                borderRadius: '14px',
                border: borderCol,
                background: bgCol,
                color: textCol,
                fontSize: '13px',
                lineHeight: 1.35,
                textAlign: 'left',
                cursor: isAudited ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                transition: 'all 0.18s ease'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '1.5px solid var(--separator-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
                background: isSelected ? 'var(--apple-blue)' : 'transparent',
                borderColor: isSelected ? 'var(--apple-blue)' : 'var(--separator-dark)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {String.fromCharCode(65 + idx)}
              </div>
              <div style={{ flex: 1 }}>
                {opt.text}
              </div>
            </button>
          );
        })}
      </div>

      {/* Audit Feedback Box */}
      {isAudited && selectedOption && (
        <div className="ios-animate-enter" style={{
          padding: '14px',
          borderRadius: '16px',
          background: selectedOption.isCorrect ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
          border: selectedOption.isCorrect ? '1.5px solid #34C759' : '1.5px solid #FF3B30',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '13.5px',
            fontWeight: 700,
            color: selectedOption.isCorrect ? '#34C759' : '#FF3B30',
            marginBottom: '6px'
          }}>
            {selectedOption.isCorrect ? '✓ ¡Dictamen Pericial Correcto!' : '✕ Dictamen Erróneo'}
          </div>

          <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.4, margin: '0 0 8px' }}>
            {selectedOption.diagnosis}
          </p>

          <div style={{
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            paddingTop: '6px',
            lineHeight: 1.35
          }}>
            <strong>Fundamento del libro:</strong> {currentCase.expertFeedback}
          </div>
        </div>
      )}

      {/* Bottom Action Button */}
      <div>
        {!isAudited ? (
          <button
            onClick={handleAuditCase}
            disabled={selectedOptionIdx === null}
            className="ios-button ios-button-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              opacity: selectedOptionIdx === null ? 0.5 : 1
            }}
          >
            <Search size={18} />
            <span>Emitir Dictamen Pericial</span>
          </button>
        ) : (
          <button
            onClick={handleNextCase}
            className="ios-button ios-button-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            <span>{currentCaseIdx < totalCases - 1 ? 'Siguiente caso' : 'Finalizar peritaje'}</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        title="¡Peritaje Concluido con Éxito!"
        subtitle="Has auditado y corregido los errores frecuentes en los instrumentos de la Semana 9."
        returnTo="/parte-2"
        scoreText={`${resolvedCases.length} de ${totalCases} casos periciales resueltos`}
        onRetry={handleRestart}
      />
    </div>
  );
};

export default LeidiDetectives;
