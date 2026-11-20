import React, { useState } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { SuccessModal } from '../../components/SuccessModal';
import { sound } from '../../utils/sound';
import { CAMILA_RUBRIC_BUILDER } from '../../data/parte2Data';
import { Swords, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck } from 'lucide-react';

export const CamilaBatalla: React.FC = () => {
  const [currentCriterionIdx, setCurrentCriterionIdx] = useState(0);
  // Assignments: criterionId -> { [level: 'C'|'B'|'A'|'AD']: descriptorId }
  const [assignments, setAssignments] = useState<{ [critId: number]: { [level: string]: string } }>({
    1: {}, 2: {}, 3: {}
  });
  const [validatedCriteria, setValidatedCriteria] = useState<number[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const totalCriteria = CAMILA_RUBRIC_BUILDER.criteria.length;
  const currentCriterion = CAMILA_RUBRIC_BUILDER.criteria[currentCriterionIdx];
  const currentAssignments = assignments[currentCriterion.id] || {};

  const levels: ('C' | 'B' | 'A' | 'AD')[] = ['C', 'B', 'A', 'AD'];
  const levelNames: { [key: string]: string } = {
    'C': 'En inicio (C)',
    'B': 'En proceso (B)',
    'A': 'Logro esperado (A)',
    'AD': 'Logro destacado (AD)'
  };

  const handleAssignDescriptor = (level: 'C' | 'B' | 'A' | 'AD', descriptorId: string) => {
    if (validatedCriteria.includes(currentCriterion.id)) return;
    sound.pop();
    setAssignments(prev => {
      const current = { ...(prev[currentCriterion.id] || {}) };
      // If already assigned to another level, remove it
      Object.keys(current).forEach(lvl => {
        if (current[lvl] === descriptorId) delete current[lvl];
      });
      current[level] = descriptorId;
      return { ...prev, [currentCriterion.id]: current };
    });
    setFeedbackMsg('');
  };

  const handleValidateCriterion = () => {
    const assigned = assignments[currentCriterion.id] || {};
    if (Object.keys(assigned).length < 4) {
      setFeedbackMsg('Asigna los descriptores a los 4 niveles antes de validar.');
      return;
    }

    // Check if each level matches
    let allMatches = true;
    levels.forEach(lvl => {
      const descId = assigned[lvl];
      const descObj = currentCriterion.shuffledDescriptors.find(d => d.id === descId);
      if (!descObj || descObj.level !== lvl) {
        allMatches = false;
      }
    });

    if (allMatches) {
      sound.success();
      if (!validatedCriteria.includes(currentCriterion.id)) {
        const next = [...validatedCriteria, currentCriterion.id];
        setValidatedCriteria(next);
        if (next.length === totalCriteria) {
          setIsSuccessOpen(true);
        }
      }
      setFeedbackMsg('¡Excelente! Descriptores graduados con perfecta coherencia.');
    } else {
      sound.error();
      setFeedbackMsg('Revisa la progresión: algunos descriptores no corresponden a su nivel de logro.');
    }
  };

  const handleNextCriterion = () => {
    if (!validatedCriteria.includes(currentCriterion.id)) return;
    sound.click();
    if (currentCriterionIdx < totalCriteria - 1) {
      setCurrentCriterionIdx(currentCriterionIdx + 1);
      setFeedbackMsg('');
    }
  };

  const handleReset = () => {
    sound.click();
    setCurrentCriterionIdx(0);
    setAssignments({ 1: {}, 2: {}, 3: {} });
    setValidatedCriteria([]);
    setFeedbackMsg('');
    setIsSuccessOpen(false);
  };

  const isCurrentValidated = validatedCriteria.includes(currentCriterion.id);

  return (
    <div className="part-two-game ios-animate-enter">
      <GameHeading 
        title="Batalla de equipos: construye la rúbrica"
        hint="Construye una rúbrica analítica contra el acoso escolar ordenando los 4 niveles de logro." 
      />

      <GameProgress value={validatedCriteria.length} total={totalCriteria} label="Criterios construidos" />

      {/* Challenge Situation Box */}
      <div className="ios-card" style={{
        padding: '16px',
        background: '#FFFFFF',
        marginBottom: '14px',
        borderLeft: '4px solid #FF9500'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Swords size={16} color="#FF9500" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF9500', textTransform: 'uppercase' }}>
            Reto Colaborativo
          </span>
        </div>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {CAMILA_RUBRIC_BUILDER.situation}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {CAMILA_RUBRIC_BUILDER.taskCondition}
        </p>
      </div>

      {/* Criterion Header */}
      <div style={{
        padding: '12px 14px',
        borderRadius: '12px',
        background: 'var(--apple-blue-tint)',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--apple-blue)' }}>
            {currentCriterion.name}
          </span>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {currentCriterion.description}
          </p>
        </div>
        {isCurrentValidated && <ShieldCheck size={22} color="var(--apple-green)" />}
      </div>

      {/* Matrix Builder: 4 Levels Slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {levels.map(lvl => {
          const assignedId = currentAssignments[lvl];
          const assignedDesc = currentCriterion.shuffledDescriptors.find(d => d.id === assignedId);

          return (
            <div
              key={lvl}
              className="ios-card"
              style={{
                padding: '12px 14px',
                background: '#FFFFFF',
                border: assignedDesc ? '1.5px solid var(--apple-blue)' : '1px dashed var(--separator-dark)',
                borderRadius: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: lvl === 'AD' ? '#AF52DE' : lvl === 'A' ? 'var(--apple-green)' : lvl === 'B' ? 'var(--apple-blue)' : 'var(--apple-red)'
                }}>
                  {levelNames[lvl]}
                </span>
                {assignedDesc && !isCurrentValidated && (
                  <button
                    onClick={() => {
                      sound.pop();
                      setAssignments(prev => {
                        const next = { ...(prev[currentCriterion.id] || {}) };
                        delete next[lvl];
                        return { ...prev, [currentCriterion.id]: next };
                      });
                    }}
                    style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Quitar
                  </button>
                )}
              </div>

              {assignedDesc ? (
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4, margin: 0 }}>
                  {assignedDesc.text}
                </p>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  Selecciona uno de los descriptores de abajo para asignar aquí.
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Available Shuffled Descriptors Bank */}
      {!isCurrentValidated && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Descriptores disponibles para clasificar:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentCriterion.shuffledDescriptors.map(desc => {
              const isUsed = Object.values(currentAssignments).includes(desc.id);
              if (isUsed) return null;

              return (
                <div
                  key={desc.id}
                  className="ios-card"
                  style={{
                    padding: '12px',
                    background: 'var(--surface-secondary)',
                    borderRadius: '12px'
                  }}
                >
                  <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '8px' }}>
                    {desc.text}
                  </p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {levels.map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => handleAssignDescriptor(lvl, desc.id)}
                        className="ios-button"
                        style={{
                          flex: 1,
                          padding: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          borderRadius: '8px',
                          background: currentAssignments[lvl] ? 'var(--surface-tertiary)' : '#FFFFFF',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--separator)'
                        }}
                      >
                        Asignar a {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback Message */}
      {feedbackMsg && (
        <div style={{
          padding: '12px',
          borderRadius: '12px',
          background: isCurrentValidated ? 'var(--apple-green-tint)' : 'var(--apple-red-tint)',
          color: isCurrentValidated ? 'var(--apple-green)' : 'var(--apple-red)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '14px',
          textAlign: 'center'
        }}>
          {feedbackMsg}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {!isCurrentValidated ? (
          <button
            onClick={handleValidateCriterion}
            className="ios-button ios-button-primary"
            style={{ flex: 1, padding: '12px' }}
          >
            <CheckCircle2 size={16} />
            <span>Validar coherencia</span>
          </button>
        ) : currentCriterionIdx < totalCriteria - 1 ? (
          <button
            onClick={handleNextCriterion}
            className="ios-button ios-button-primary"
            style={{ flex: 1, padding: '12px' }}
          >
            <span>Siguiente Criterio</span>
            <ArrowRight size={15} />
          </button>
        ) : null}

        <button
          onClick={handleReset}
          className="ios-button ios-button-secondary"
          style={{ padding: '12px 14px' }}
          title="Reiniciar rúbrica"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        title="¡Rúbrica Analítica Construida con Éxito!"
        subtitle="Construiste coherentemente los 3 criterios y 4 niveles de logro para la prevención del acoso escolar."
        returnTo="/parte-2"
        scoreText="Rúbrica 100% Coherente y Aprobada"
        onRetry={handleReset}
      />
    </div>
  );
};
